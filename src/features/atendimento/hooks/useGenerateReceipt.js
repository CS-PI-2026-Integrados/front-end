import { useCallback } from 'react'
import { salvarComprovante } from '@/features/atendimento/services/atendimentoService'
import { useSession } from '@/features/autenticacao/context/sessionContext'
import { useTenant } from '@/features/instituicoes/context/tenantContext'

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
        setTimeout(() => {
          try {
            const { apenado, processo, fotoAtendimento, mudancasDetectadas = {} } = params

            if (!apenado) {
              return reject(new Error('Dados do apenado não fornecidos para gerar o comprovante'))
            }

            const now = new Date().toISOString()
            const apenadoFinal = apenado

            const novaPresenca = {
              id: `${Date.now()}`,
              apenadoId: apenadoFinal?.id,
              tenantId: apenadoFinal?.tenantId,
              processoId: processo?.id,
              nomeApenado: apenadoFinal?.nomeCompleto,
              photoUrl: fotoAtendimento,
              cpfApenado: apenadoFinal.cpf,
              emitidoEm: now,
              nomeOperador: usuario,
              codigoVerificacao: `COMP-${new Date(now).getTime()}-${generateRandomCode()}`,
              alteracoesRastreadas: Object.entries(mudancasDetectadas)
                .filter(([, m]) => m.mudou)
                .reduce(
                  (acc, [field, data]) => ({
                    ...acc,
                    [field]: data,
                  }),
                  {}
                ),

              configuracaoInstituicao: {
                nomeComarca: tenantState.nomeComarca,
                unidade: tenantState.unidade,
                endereco: tenantState.endereco,
                logo: tenantState.logo,
                receiptConfig: { ...tenantState.receiptConfig },
                receiptFields: tenantState.receiptFields.map((f) => ({ ...f })),
              },
            }

            resolve(salvarComprovante(novaPresenca))
          } catch (error) {
            reject(error)
          }
        }, 500)
      }),
    [usuario, tenantState]
  )

  return { generateReceipt }
}
