import { useCallback } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { presencasStore } from '@/mocks/presenca.mock.js'
import { useSession } from '@/context/SessionContext.jsx'

export const generateAuthCode = () => {
  const data = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const serial = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `COMP-${data}-${serial}`
}

export function useGenerateReceipt() {
  const { session } = useSession()
  const usuario = session?.tenant?.user?.name

  const generateReceipt = useCallback(
    (params = {}) =>
      new Promise((resolve, reject) => {
        // Apenas para mock. Futuramente, implementação pra API
        setTimeout(() => {
          try {
            const { apenado, processo, fotoAtendimento, mudancasDetectadas = {} } = params

            if (!apenado) {
              return reject(new Error('Dados do apenado não fornecidos para gerar o comprovante'))
            }

            const now = new Date().toISOString()
            const apenadoFinal = { ...apenado, lastProof: now }

            const index = mockApenados.apenados.findIndex((a) => a.id === apenadoFinal.id)

            if (index !== -1) {
              mockApenados.apenados[index] = apenadoFinal
            }

            const novaPresenca = {
              id: String(presencasStore.getSnapshot().length + 1),
              apenadoId: apenadoFinal?.id,
              tenantId: apenadoFinal?.tenantId,
              processoId: processo?.id,
              apenadoName: apenadoFinal?.fullName,
              cpf: apenadoFinal.cpf,
              dateTime: now,
              operatorName: usuario || 'Servidor',
              verificationCode: generateAuthCode(),
              photoUrl: fotoAtendimento,
              mudancasRastreadas: mudancasDetectadas,
            }

            // Persiste o comprovante na store simulando um cache de backend
            presencasStore.addPresenca(novaPresenca)

            resolve(novaPresenca)
          } catch (error) {
            reject(error)
          }
        }, 500)
      }),
    [usuario]
  )

  return { generateReceipt }
}
