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
        operatorName: session?.user?.name || 'Administrador',
        institution: {
          nomeComarca: tenantState?.nomeComarca || 'Comarca Central',
          unidade: tenantState?.unidade || 'Vara de Execuções Penais',
          endereco: tenantState?.endereco || '',
          logo: tenantState?.logo || null,
          receiptConfig: { ...(tenantState?.receiptConfig || {}) },
          receiptFields: (tenantState?.receiptFields || []).map((field) => ({ ...field })),
        },
      }),
    [session?.user?.name, tenantState]
  )

  return { generateReceipt }
}
