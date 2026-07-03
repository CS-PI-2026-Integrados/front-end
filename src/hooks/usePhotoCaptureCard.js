import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useSession } from '@/context/sessionContext'

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
          setFoto(event.target.result)
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
        } catch (err) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        }
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      streamRef.current = stream
      setPhotoStreaming(true)
    } catch (err) {
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

    // O preview na tela usa aspect-[3/4] (retrato).
    // Precisamos cortar a imagem real na mesma proporção para não distorcer.
    const targetAspect = 3 / 4
    const videoAspect = video.videoWidth / video.videoHeight

    let cropWidth, cropHeight
    if (videoAspect > targetAspect) {
      // Vídeo é mais largo (ex: 16:9), vamos limitar pela altura
      cropHeight = video.videoHeight
      cropWidth = cropHeight * targetAspect
    } else {
      // Vídeo é mais alto, limitamos pela largura
      cropWidth = video.videoWidth
      cropHeight = cropWidth / targetAspect
    }

    // Garantir números inteiros para evitar problemas de "stride" (imagem corrompida)
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

    // Usar PNG ao invés de JPEG. O motor do PDF (pdfmake) tem um bug conhecido
    // com alguns tipos de JPEG gerados pelo Canvas que causam corrupção de cor e scanlines.
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
