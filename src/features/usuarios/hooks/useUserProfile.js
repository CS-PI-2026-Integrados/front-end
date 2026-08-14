import { useState, useCallback } from 'react'
import { useSession } from '@/features/autenticacao/context/sessionContext'

const CAMERA_KEY = (userId) => `sicape:camera:${userId}`

async function fetchVideoDevices() {
  if (!navigator?.mediaDevices?.enumerateDevices) return []

  try {
    // Solicita permissão para obter os labels dos dispositivos
    const stream = await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null)
    const devices = await navigator.mediaDevices.enumerateDevices()
    if (stream) stream.getTracks().forEach((t) => t.stop())

    return devices.filter((d) => d.kind === 'videoinput')
  } catch {
    return []
  }
}

export function useUserProfile() {
  const { session } = useSession()
  const userId = session?.user?.id

  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(() => {
    return userId ? localStorage.getItem(CAMERA_KEY(userId)) || '' : ''
  })
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const loadCameras = useCallback(async () => {
    setCameraLoading(true)
    setCameraError(null)

    const devices = await fetchVideoDevices()

    if (devices.length === 0) {
      setCameraError('Nenhuma câmera encontrada. Verifique as permissões do navegador.')
    }

    setCameras(devices)
    setCameraLoading(false)
  }, [])

  const handleCameraChange = useCallback(
    (deviceId) => {
      setSelectedCamera(deviceId)
      if (userId) {
        localStorage.setItem(CAMERA_KEY(userId), deviceId)
      }
    },
    [userId]
  )

  return {
    cameras,
    selectedCamera,
    cameraLoading,
    cameraError,
    loadCameras,
    handleCameraChange,
  }
}
