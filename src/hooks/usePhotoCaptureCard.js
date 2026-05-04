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
    const url = URL.createObjectURL(photo)
    return url
  }, [photo])

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) {
        onPhotoSelect?.(file)
      }
    },
    [onPhotoSelect]
  )

  const clearPhoto = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    onPhotoSelect?.(null)
  }, [onPhotoSelect])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsStreaming(true)
    } catch (err) {
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
      console.error('Erro ao acessar a câmera:', err)
    }
  }, [])

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
    clearPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    openFileDialog,
  }
}
