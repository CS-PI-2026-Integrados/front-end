import { useCallback } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockPresenca } from '@/mocks/presenca.mock.js'
import { useSession } from '@/context/SessionContext.jsx'

const generateRandomCode = (length = 9) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
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
              id: String(mockPresenca.presencas.length + 1),
              apenadoId: apenadoFinal?.id,
              tenantId: apenadoFinal?.tenantId,
              processoId: processo?.id,
              apenadoName: apenadoFinal?.fullName,
              cpf: apenadoFinal.cpf,
              dateTime: now,
              operatorName: usuario || 'Servidor',
              verificationCode: `COMP-${new Date(now).getTime()}-${generateRandomCode()}`,
              photoUrl: fotoAtendimento,
              mudancasRastreadas: mudancasDetectadas,
            }

            // Persiste o comprovante, futuramente rota /presencas ou comprovantes
            mockPresenca.presencas.push(novaPresenca)
            console.log(mockPresenca.presencas)
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
