import { useCallback } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { presencasStore } from '@/mocks/presenca.mock.js'
import { useSession } from '@/context/sessionContext'
import { useTenant } from '@/context/TenantContext'

const generateRandomCode = (length = 9) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
}

export function useGenerateReceipt() {
  const { session } = useSession()
  const { state: tenantState } = useTenant()
  const usuario = session?.user?.name

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

            //remover quando conectar o springboot
            const index = mockApenados.apenados.findIndex((a) => a.id === apenadoFinal.id)
            if (index !== -1) {
              mockApenados.apenados[index] = apenadoFinal
            }

            const novaPresenca = {
              idApenado: apenadoFinal?.id,
              idTenant: apenadoFinal?.tenantId,
              idProcesso: processo?.id,
              name: apenadoFinal?.fullName,
              photo64: fotoAtendimento,
              cpf: apenadoFinal.cpf,
              timestamp: now,
              operatorName: usuario,
              proofCode: `COMP-${new Date(now).getTime()}-${generateRandomCode()}`,
              mudancasRastreadas: Object.entries(mudancasDetectadas)
                .filter(([, m]) => m.mudou)
                .reduce(
                  (acc, [field, data]) => ({
                    ...acc,
                    [field]: data,
                  }),
                  {}
                ),

              tenantConfig: {
                nomeComarca: tenantState.nomeComarca,
                unidade: tenantState.unidade,
                endereco: tenantState.endereco,
                logo: tenantState.logo,
                receiptConfig: { ...tenantState.receiptConfig },
                receiptFields: tenantState.receiptFields.map((f) => ({ ...f })),
              },
            }

            //persiste o comprovante, futuramente rota /presencas ou comprovantes
            presencasStore.addPresenca(novaPresenca)
            resolve(novaPresenca)
          } catch (error) {
            reject(error)
          }
        }, 500)
      }),
    [usuario, tenantState]
  )

  return { generateReceipt }
}
