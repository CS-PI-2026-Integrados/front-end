import { useState, useRef, useEffect, useCallback } from 'react'

export function usePhotoCaptureCard({ onPhotoSelect }) {
  const [preview, setPreview] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
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

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const imageUrl = URL.createObjectURL(file)
        setPreview(imageUrl)
        onPhotoSelect?.(file)
      }
    },
    [onPhotoSelect]
  )

  const clearPhoto = useCallback(() => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onPhotoSelect?.(null)
  }, [onPhotoSelect])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsStreaming(true)
    } catch (err) {
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

    setPreview(base64Image)
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
