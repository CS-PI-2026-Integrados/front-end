import { useEffect, useRef, useState } from 'react'
import { useAtendimento } from '../context/attendanceContext'
import { useGenerateReceipt } from './useGenerateReceipt'
import { getCameraPreference } from '@/features/users'
import { useSession } from '@/features/authentication'

export function useReceiptFlow() {
  const attendance = useAtendimento()
  const { session } = useSession()
  const { generateReceipt } = useGenerateReceipt()
  const [deviceId, setDeviceId] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const [fields, setFields] = useState([])
  const pending = useRef(false)
  const active = useRef(true)
  const controller = useRef(null)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
      controller.current?.abort()
    }
  }, [])
  useEffect(() => {
    setDeviceId(getCameraPreference(session?.user?.id))
  }, [session?.user?.id])
  const submit = async (event) => {
    event?.preventDefault()
    if (pending.current || attendance.receipt) return
    attendance.setHasSubmitted(true)
    const missingFields = []
    if (!attendance.convicted)
      missingFields.push({ field: 'convictedId', message: 'Selecione um apenado.' })
    else if (attendance.process?.status !== 'ACTIVE')
      missingFields.push({ field: 'processId', message: 'Selecione um processo ativo vinculado.' })
    if (missingFields.length) {
      setFields(missingFields)
      setError('Selecione um apenado e um processo ativo vinculado.')
      return
    }
    if (attendance.addressError) {
      setFields([{ field: 'address', message: attendance.addressError }])
      setError(attendance.addressError)
      return
    }
    pending.current = true
    setSubmitting(true)
    setError(null)
    setFields([])
    controller.current = new AbortController()
    try {
      const receipt = await generateReceipt(
        {
          convictedId: attendance.convicted.id,
          processId: attendance.process.id,
          address: attendance.convicted.address,
          phone: attendance.convicted.phone,
          employmentStatus: attendance.convicted.employmentStatus,
          photo: attendance.photo,
        },
        { signal: controller.current.signal }
      )
      if (active.current) attendance.setReceipt(receipt)
    } catch (cause) {
      if (active.current && cause.name !== 'AbortError') {
        setError(cause.message)
        setFields(cause.fields || [])
      }
    } finally {
      pending.current = false
      if (active.current) setSubmitting(false)
    }
  }
  const fieldErrors = Object.fromEntries(fields.map(({ field, message }) => [field, message]))
  fieldErrors.address = fields
    .filter(({ field }) => field === 'address' || field.startsWith('address.'))
    .map(({ message }) => message)
    .join(' ')
  return {
    ...attendance,
    deviceId,
    submit,
    isSubmitting,
    error,
    fields,
    fieldErrors,
    photoError,
    setPhotoError,
  }
}
