export const mockCertificados = {
  grupos: [
    {
      id: 'g1',
      nome: 'Grupo Reflexivo - Violência Doméstica',
      periodo: 'Jan/2024 - Mar/2024',
      encontros: 12,
      encontrosConcluidos: 12,
      status: 'CONCLUÍDO',
    },
    {
      id: 'g2',
      nome: 'Prestação de Serviço à Comunidade',
      periodo: 'Abr/2024 - Jun/2024',
      encontros: 8,
      encontrosConcluidos: 5,
      status: 'EM ANDAMENTO',
    },
    {
      id: 'g3',
      nome: 'Restrição de Fim de Semana',
      periodo: 'Jul/2024 - Set/2024',
      encontros: 10,
      encontrosConcluidos: 10,
      status: 'CONCLUÍDO',
    },
  ],

  participantes: [
    {
      id: 'part1',
      apenadoId: '1',
      grupoId: 'g1',
      emitidoEm: '2024-03-30T10:00:00',
      operador: 'Admin User',
    },
    {
      id: 'part2',
      apenadoId: '1',
      grupoId: 'g2',
      emitidoEm: null,
      operador: 'Admin User',
    },
    {
      id: 'part3',
      apenadoId: '2',
      grupoId: 'g1',
      emitidoEm: '2024-03-30T14:00:00',
      operador: 'Operator User',
    },
    {
      id: 'part4',
      apenadoId: '3',
      grupoId: 'g3',
      emitidoEm: '2024-09-28T09:00:00',
      operador: 'Admin User',
    },
  ],
}
