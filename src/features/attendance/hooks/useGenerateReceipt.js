import { useCallback } from 'react'
import { gerarComprovante } from '@/features/attendance/services/attendanceService'
import { useSession } from '@/features/authentication/context/sessionContext'
import { useTenant } from '@/features/institutions/context/tenantContext'

export function useGenerateReceipt() {
  const { session } = useSession()
  const { state: tenantState } = useTenant()
  const generateReceipt = useCallback(
    (params = {}) =>
      gerarComprovante({
        ...params,
        operatorName: session?.user?.name,
        institution: {
          nomeComarca: tenantState.nomeComarca,
          unidade: tenantState.unidade,
          endereco: tenantState.endereco,
          logo: tenantState.logo,
          receiptConfig: { ...tenantState.receiptConfig },
          receiptFields: tenantState.receiptFields.map((field) => ({ ...field })),
        },
      }),
    [session?.user?.name, tenantState]
  )

  return { generateReceipt }
}
