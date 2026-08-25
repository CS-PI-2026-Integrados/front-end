export const mockEnderecos = {
  enderecos: [
    {
      id: 'end-1',
      apenadoId: '1',
      cep: '01001-000',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    {
      id: 'end-2',
      apenadoId: '2',
      cep: '01310-100',
      logradouro: 'Av. Brasil',
      numero: '456',
      complemento: '',
      bairro: 'Vila Nova',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    {
      id: 'end-3',
      apenadoId: '3',
      cep: '01452-000',
      logradouro: 'Rua XV de Novembro',
      numero: '789',
      complemento: 'Bloco B',
      bairro: 'Jardim Europa',
      cidade: 'São Paulo',
      uf: 'SP',
    },
    {
      id: 'end-4',
      apenadoId: '4',
      cep: '80410-180',
      logradouro: 'Rua Sete de Setembro',
      numero: '321',
      complemento: '',
      bairro: 'Centro',
      cidade: 'Curitiba',
      uf: 'PR',
    },
    {
      id: 'end-5',
      apenadoId: '5',
      cep: '01311-200',
      logradouro: 'Av. Paulista',
      numero: '1500',
      complemento: 'Conjunto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
    },
  ],
}

export function getEnderecoByApenadoId(apenadoId) {
  const lista = mockEnderecos.enderecos || []
  return lista.find((e) => String(e.apenadoId) === String(apenadoId)) || null
}

export function getEnderecoByCep(cep) {
  const clean = (cep || '').replace(/\D/g, '')
  const lista = mockEnderecos.enderecos || []
  return lista.find((e) => (e.cep || '').replace(/\D/g, '') === clean) || null
}

export default mockEnderecos
