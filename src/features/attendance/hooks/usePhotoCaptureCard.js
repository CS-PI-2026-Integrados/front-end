import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useSession } from '@/features/authentication/context/sessionContext'

export function usePhotoCaptureCard({
  photo,
  isStreaming,
  setFoto,
  setPhotoStreaming,
  setPhotoError,
  clearPhoto,
}) {
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const { session } = useSession()

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setPhotoStreaming(false)
  }, [setPhotoStreaming])

  const preview = useMemo(() => {
    if (!photo) return null
    if (typeof photo === 'string') return photo
    return URL.createObjectURL(photo)
  }, [photo])

  useEffect(() => {
    return () => {
      if (preview && typeof preview === 'string' && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isStreaming])

  const handleFileChange = useCallback(
    (e) => {
      e.stopPropagation()
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = new Image()
          img.onload = () => {
            const targetAspect = 3 / 4
            const imgAspect = img.width / img.height

            let cropWidth, cropHeight
            if (imgAspect > targetAspect) {
              cropHeight = img.height
              cropWidth = cropHeight * targetAspect
            } else {
              cropWidth = img.width
              cropHeight = cropWidth / targetAspect
            }

            cropWidth = Math.floor(cropWidth)
            cropHeight = Math.floor(cropHeight)

            const startX = Math.floor((img.width - cropWidth) / 2)
            const startY = Math.floor((img.height - cropHeight) / 2)

            const canvas = document.createElement('canvas')
            canvas.width = cropWidth
            canvas.height = cropHeight

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

            const base64Image = canvas.toDataURL('image/png')
            setFoto(base64Image)
          }
          img.src = event.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    [setFoto]
  )

  const startCamera = useCallback(async () => {
    setPhotoError(null)
    stopCamera()

    const userId = session?.user?.id
    const savedCameraId = userId ? localStorage.getItem(`sicape:camera:${userId}`) : null

    try {
      let stream
      if (savedCameraId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: savedCameraId } },
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = stream
      setPhotoStreaming(true)
    } catch {
      setPhotoError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }, [stopCamera, setPhotoStreaming, setPhotoError, session?.user?.id])

  const discardPhoto = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    clearPhoto()
    startCamera()
  }, [clearPhoto, startCamera])

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    const targetAspect = 3 / 4
    const videoAspect = video.videoWidth / video.videoHeight

    let cropWidth, cropHeight
    if (videoAspect > targetAspect) {
      cropHeight = video.videoHeight
      cropWidth = cropHeight * targetAspect
    } else {
      cropWidth = video.videoWidth
      cropHeight = cropWidth / targetAspect
    }

    cropWidth = Math.floor(cropWidth)
    cropHeight = Math.floor(cropHeight)

    const startX = Math.floor((video.videoWidth - cropWidth) / 2)
    const startY = Math.floor((video.videoHeight - cropHeight) / 2)

    const canvas = document.createElement('canvas')
    canvas.width = cropWidth
    canvas.height = cropHeight

    const ctx = canvas.getContext('2d')
    ctx.translate(cropWidth, 0)
    ctx.scale(-1, 1)

    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

    const base64Image = canvas.toDataURL('image/png')

    stopCamera()
    setFoto(base64Image)
  }, [stopCamera, setFoto])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    preview,
    videoRef,
    fileInputRef,
    handleFileChange,
    discardPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    openFileDialog,
  }
}
