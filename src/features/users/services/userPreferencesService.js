import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'

const cameraKey = (userId) => `sicape:camera:${userId}`

export function getCameraPreference(userId) {
  return userId ? readJson(cameraKey(userId), '') : ''
}

export function saveCameraPreference(userId, deviceId) {
  if (userId) writeJson(cameraKey(userId), deviceId)
}
