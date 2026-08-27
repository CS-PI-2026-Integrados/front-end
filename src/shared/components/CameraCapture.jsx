import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

const DEFAULT_ACCEPT = 'image/png,image/jpeg'

function cropToPng(source, aspectRatio) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const sourceUrl = typeof source === 'string' ? source : URL.createObjectURL(source)
    image.onload = () => {
      const sourceAspect = image.width / image.height
      const width = sourceAspect > aspectRatio ? image.height * aspectRatio : image.width
      const height = sourceAspect > aspectRatio ? image.height : image.width / aspectRatio
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(width)
      canvas.height = Math.floor(height)
      canvas
        .getContext('2d')
        .drawImage(
          image,
          (image.width - width) / 2,
          (image.height - height) / 2,
          width,
          height,
          0,
          0,
          canvas.width,
          canvas.height
        )
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Não foi possível processar a imagem.'))
        resolve(new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' }))
      }, 'image/png')
      if (typeof source !== 'string') URL.revokeObjectURL(sourceUrl)
    }
    image.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
    image.src = sourceUrl
  })
}

export function CameraCapture({
  file = null,
  onCapture,
  onClear,
  deviceId,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  aspectRatio = 3 / 4,
  onError,
  className,
}) {
  const videoRef = useRef(null)
  const inputRef = useRef(null)
  const streamRef = useRef(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsStreaming(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])
  useEffect(() => {
    if (isStreaming && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [isStreaming])

  const startCamera = useCallback(async () => {
    try {
      stopCamera()
      const video = deviceId ? { deviceId: { exact: deviceId } } : true
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video })
      setIsStreaming(true)
    } catch {
      onError?.('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    }
  }, [deviceId, onError, stopCamera])

  const emitImage = useCallback(
    async (source) => {
      try {
        const image = await cropToPng(source, aspectRatio)
        onCapture(image)
        stopCamera()
      } catch (error) {
        onError?.(error.message)
      }
    },
    [aspectRatio, onCapture, onError, stopCamera]
  )

  const takePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0)
    emitImage(canvas.toDataURL('image/png'))
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {preview ? (
        <>
          <img
            src={preview}
            alt="Prévia da captura"
            className="aspect-3/4 w-full max-w-70 rounded-xl border object-cover shadow-sm"
          />
          <Button type="button" variant="outline" disabled={disabled} onClick={onClear}>
            Descartar foto
          </Button>
        </>
      ) : isStreaming ? (
        <>
          <div className="relative aspect-3/4 w-full max-w-70 overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="size-full scale-x-[-1] object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={stopCamera}
            >
              <X />
            </Button>
          </div>
          <Button type="button" disabled={disabled} onClick={takePhoto}>
            <Camera />
            Tirar foto
          </Button>
        </>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Button type="button" variant="outline" disabled={disabled} onClick={startCamera}>
            <Camera />
            Iniciar captura
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            Upload de foto
          </Button>
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept={accept}
            onChange={(event) => event.target.files?.[0] && emitImage(event.target.files[0])}
          />
        </div>
      )}
    </div>
  )
}
