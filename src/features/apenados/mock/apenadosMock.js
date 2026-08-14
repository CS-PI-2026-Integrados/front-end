export const APENADOS_STORAGE_KEY = 'sicape:apenados:v1'

export const apenadosIniciais = [
  {
    id: '1',
    tenantId: '1',
    nomeCompleto: 'João Silva Santos',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    situacaoTrabalhista: 'registrado',
    situacao: 'ativo',
    fotoUrl: null,
    observacoes: '',
    processos: [
      {
        id: 'p1',
        tenantId: '1',
        apenadoId: '1',
        numeroProcesso: '0001234-56.2023.8.00.0001',
        vara: 'Vara criminal',
        tipoPena: 'Prestação de serviço à comunidade',
        situacao: 'ativo',
      },
    ],
  },
]
