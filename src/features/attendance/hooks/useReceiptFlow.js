import { useCallback, useEffect, useState } from 'react'
import { useAtendimento } from '@/features/attendance'
import { useGenerateReceipt } from '@/features/attendance/hooks/useGenerateReceipt'
import { getMudancasAtivas } from '@/features/attendance/utils/attendanceUtils'
import { getCameraPreference } from '@/features/users'
import { useSession } from '@/features/authentication'

export function useReceiptFlow() {
  const attendance = useAtendimento()
  const { session } = useSession()
  const { generateReceipt } = useGenerateReceipt()
  const [deviceId, setDeviceId] = useState('')

  useEffect(() => setDeviceId(getCameraPreference(session?.user?.id)), [session?.user?.id])

  const submit = useCallback(
    async (event) => {
      event?.preventDefault()
      attendance.setError('')
      attendance.setSubmitting(true)
      try {
        const receipt = await generateReceipt({
          apenado: attendance.apenado,
          processo: attendance.processo,
          photoFile: attendance.fotoAtendimento.data,
          tenantId: session?.tenant?.id,
          mudancasDetectadas: getMudancasAtivas(attendance.mudancas),
        })
        attendance.setReciboGerado(receipt)
        attendance.setSuccess(true)
      } catch (error) {
        attendance.setError(error.message || 'Falha ao gerar comprovante. Tente novamente.')
      } finally {
        attendance.setSubmitting(false)
      }
    },
    [attendance, generateReceipt, session?.tenant?.id]
  )

  return { ...attendance, deviceId, submit }
}
