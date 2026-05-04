import { useCallback } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockPresenca } from '@/mocks/presenca.mock.js'

const generateRandomCode = (length = 9) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase()
}

export function useGenerateReceipt({ setAtendimento, fotoAtendimento }) {
  const generateReceipt = useCallback(
    (params = {}) => {
      const { apenadoAtualizado, foiAlterado, processoAtivo } = params
      if (!apenadoAtualizado) return

      const now = new Date().toISOString()
      const apenadoFinal = { ...apenadoAtualizado, lastProof: now }

      if (foiAlterado) {
        const index = mockApenados.apenados.findIndex((a) => a.id === apenadoFinal.id)
        if (index !== -1) {
          mockApenados.apenados[index] = apenadoFinal
        }
      }

      setAtendimento((prev) => ({
        ...prev,
        apenado: apenadoFinal,
        processo: processoAtivo || prev.processo,
      }))

      const snapshot = {
        idApenado: apenadoFinal?.id,
        idTenant: apenadoFinal?.tenantId,
        name: apenadoFinal?.fullName,
        photo64: fotoAtendimento,
        cpf: apenadoFinal.cpf,
        timestamp: now,
        operatorName: 'Admin',
        proofCode: `COMP-${new Date(now).getTime()}-${generateRandomCode()}`,
      }

      const novaPresenca = {
        id: Date.now().toString(),
        apenadoId: snapshot.idApenado,
        tenantId: snapshot.idTenant,
        apenadoName: snapshot.name,
        cpf: snapshot.cpf,
        dateTime: snapshot.timestamp,
        operatorName: snapshot.operatorName,
        verificationCode: snapshot.proofCode,
        photoUrl: snapshot.photo64,
        pdfUrl: null,
      }

      mockPresenca.presencas.push(novaPresenca)
      console.log('Nova presença registrada no mock:', novaPresenca)
      console.log('Total de presenças agora:', mockPresenca.presencas.length)
    },
    [fotoAtendimento, setAtendimento]
  )

  return { generateReceipt }
}
