import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { toPhotoBlob } from '@/shared/lib/image'

const DEFAULT_ACCEPT = 'image/png,image/jpeg'

export function CameraCapture({
  file = null,
  onCapture,
  onClear,
  deviceId,
  disabled = false,
  accept = DEFAULT_ACCEPT,
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
    (source) => {
      try {
        onCapture(toPhotoBlob(source))
        stopCamera()
      } catch {
        onError?.('Use uma foto JPEG ou PNG de até 5 MiB.')
      }
    },
    [onCapture, onError, stopCamera]
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
            className="aspect-square w-full max-w-70 rounded-xl border object-contain shadow-sm"
          />
          <Button type="button" variant="outline" disabled={disabled} onClick={onClear}>
            Descartar foto
          </Button>
        </>
      ) : isStreaming ? (
        <>
          <div className="relative aspect-square w-full max-w-70 overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="size-full scale-x-[-1] object-contain"
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
