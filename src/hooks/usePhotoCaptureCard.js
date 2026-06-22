import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

export function usePhotoCaptureCard({ photo, onPhotoSelect }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
  }, [])

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
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          onPhotoSelect?.(event.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    [onPhotoSelect]
  )

  const startCamera = useCallback(async () => {
    setError(null)
    stopCamera()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setIsStreaming(true)
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }, [stopCamera])

  const discardPhoto = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    onPhotoSelect?.(null)
    startCamera()
  }, [onPhotoSelect, startCamera])

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const base64Image = canvas.toDataURL('image/jpeg', 0.9)

    stopCamera()
    onPhotoSelect?.(base64Image)
  }, [onPhotoSelect, stopCamera])

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
    error,
    isStreaming,
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
