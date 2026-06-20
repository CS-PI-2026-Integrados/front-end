import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'

const STORAGE_KEY = 'apenados_data_v4'

export default function ApenadoProfile() {
  const { id } = useParams()
  const { session } = useSession()
  const navigate = useNavigate()

  const [apenado, setApenado] = useState(null)
  const [loading, setLoading] = useState(true)

  const comarcaId = session?.tenant?.id

  useEffect(() => {
    const carregarPerfil = () => {
      setLoading(true)

      const dadosSalvos = localStorage.getItem(STORAGE_KEY)
      const dados = JSON.parse(dadosSalvos || '[]')

      const encontrado = dados.find((a) => {
        const matchId = String(a.id) === String(id)
        const matchTenant = comarcaId ? String(a.tenant_id) === String(comarcaId) : true
        return matchId && matchTenant
      })

      if (encontrado) {
        setApenado(encontrado)
      } else {
        setApenado(null)
      }
      setLoading(false)
    }

    carregarPerfil()
  }, [id, comarcaId])

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white text-gray-500">
        Carregando informações...
      </div>
    )

  if (!apenado)
    return (
      <div className="min-h-screen bg-white p-4">
        <p className="font-medium text-gray-600">
          Apenado não encontrado ou acesso restrito a esta comarca.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 font-bold text-green-800 underline hover:text-green-900"
        >
          Voltar para a listagem
        </button>
      </div>
    )

  return (
    <div className="min-h-screen bg-white p-1 sm:p-4">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-sm text-gray-400 transition-colors hover:text-green-800"
        >
          ← Voltar para listagem
        </button>
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-gray-900 sm:text-3xl">
          Perfil do Apenado
        </h1>
        <p className="mt-1 text-sm text-gray-400">Dados essenciais e situação processual</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm sm:p-6">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-2xl border-2 border-green-800 bg-gray-50 sm:h-40 sm:w-40">
              {apenado.foto ? (
                <img src={apenado.foto} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  Sem Foto
                </div>
              )}
            </div>
            <h2 className="text-xl leading-tight font-bold break-words text-gray-900">
              {apenado.nome}
            </h2>
            <p className="mt-1 text-sm font-medium break-words text-gray-400">CPF: {apenado.cpf}</p>
            <div className="mt-4">
              <span
                className={`inline-block rounded-full border px-4 py-1 text-xs font-bold ${
                  apenado.status === 'Inativo'
                    ? 'border-gray-200 bg-gray-100 text-gray-500'
                    : 'border-green-200 bg-green-100 text-green-700'
                }`}
              >
                {apenado.status}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
              Módulos Adicionais
            </h3>
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 py-3 text-sm font-semibold text-gray-300"
            >
              Captura de Comparecimento
            </button>
            <p className="mt-2 text-center text-[10px] text-gray-400 italic">Implementar...</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-8">
            <h3 className="mb-6 border-b border-gray-50 pb-4 text-lg font-bold text-green-800">
              Painel Civil
            </h3>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Telefone de Contato
                </label>
                <p className="text-sm font-medium text-gray-700">{apenado.telefone}</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Data de Nascimento
                </label>
                <p className="text-sm font-medium text-gray-700">
                  {apenado.data_nascimento || 'Não informada'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Endereço Completo
                </label>
                <p className="text-sm leading-relaxed font-medium break-words text-gray-700">
                  {apenado.endereco}
                </p>
              </div>

              <div className="border-t border-gray-50 pt-4 md:col-span-2">
                <h4 className="mb-4 text-sm font-bold tracking-tight text-gray-900 uppercase">
                  Dados Processuais
                </h4>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Número do Processo
                </label>
                <p className="text-sm font-medium break-words text-gray-700">
                  {apenado.numero_processo}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Vara de Execução
                </label>
                <p className="text-sm font-medium text-gray-700">{apenado.vara}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-50 pt-6">
              <label className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Observações do Prontuário
              </label>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed break-words text-gray-600 italic">
                {apenado.observacoes || 'Nenhuma observação registrada até o momento.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
