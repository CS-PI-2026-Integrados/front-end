import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/features/authentication/context/sessionContext'
import { useApenados } from '@/features/convicteds/hooks/useConvicteds'

export default function ApenadoProfile() {
  const { id } = useParams()
  const { session } = useSession()
  const navigate = useNavigate()

  const comarcaId = session?.tenant?.id
  const { apenados } = useApenados(comarcaId)
  const apenado = useMemo(
    () => apenados.find((item) => String(item.id) === String(id) && item.tenantId === comarcaId),
    [apenados, comarcaId, id]
  )

  if (!apenado)
    return (
      <div className="bg-background text-card-foreground min-h-screen p-4">
        <p className="text-muted-foreground font-medium">
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
    <div className="bg-background text-card-foreground min-h-screen p-1 sm:p-4">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground mb-4 flex items-center text-sm transition-colors hover:text-green-800"
        >
          ← Voltar para listagem
        </button>
        <h1 className="text-foreground text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
          Perfil do Apenado
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Dados essenciais e situação processual</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="border-border bg-card rounded-xl border p-4 text-center shadow-sm sm:p-6">
            <div className="bg-card text-muted-foreground mx-auto mb-4 h-32 w-32 overflow-hidden rounded-2xl border-2 border-green-800 sm:h-40 sm:w-40">
              {apenado.referencePhotoUrl ? (
                <img
                  src={apenado.referencePhotoUrl}
                  alt="Foto"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  Sem Foto
                </div>
              )}
            </div>
            <h2 className="text-foreground text-xl leading-tight font-bold break-words">
              {apenado.fullName}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium break-words">
              CPF: {apenado.cpf}
            </p>
            <div className="mt-4">
              <span
                className={`inline-block rounded-full border px-4 py-1 text-xs font-bold ${
                  apenado.status === 'Inativo'
                    ? 'border-border dark:border-border dark:text-muted-foreground bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-950 dark:ring-slate-700'
                    : 'border-border dark:border-border bg-slate-200 text-slate-900 ring-slate-300 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700'
                }`}
              >
                {apenado.status}
              </span>
            </div>
          </div>

          <div className="border-border bg-card rounded-xl border p-4 shadow-sm sm:p-6">
            <h3 className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
              Módulos Adicionais
            </h3>
            <button
              disabled
              className="border-border bg-card text-muted-foreground w-full cursor-not-allowed rounded-lg border py-3 text-sm font-semibold"
            >
              Captura de Comparecimento
            </button>
            <p className="text-muted-foreground mt-2 text-center text-[10px] italic">
              Implementar...
            </p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="border-border bg-card rounded-xl border p-4 shadow-sm sm:p-8">
            <h3 className="border-border text-foreground mb-6 border-b pb-4 text-lg font-bold">
              Painel Civil
            </h3>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
                  Telefone de Contato
                </label>
                <p className="text-foreground text-sm font-medium">{apenado.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
                  Data de Nascimento
                </label>
                <p className="text-foreground text-sm font-medium">
                  {apenado.dateOfBirth || 'Não informada'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
                  Endereço Completo
                </label>
                <p className="text-foreground text-sm leading-relaxed font-medium break-words">
                  {apenado.address || 'Não informado'}
                </p>
              </div>

              <div className="border-border border-t pt-4 md:col-span-2">
                <h4 className="text-foreground mb-4 text-sm font-bold tracking-tight uppercase">
                  Dados Processuais
                </h4>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
                  Número do Processo
                </label>
                <p className="text-foreground text-sm font-medium break-words">
                  {apenado.processos?.[0]?.processNumber || apenado.processNumber || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-[10px] font-bold tracking-wider uppercase">
                  Vara de Execução
                </label>
                <p className="text-foreground text-sm font-medium">
                  {apenado.processos?.[0]?.court || apenado.court || 'N/A'}
                </p>
              </div>
            </div>

            <div className="border-border mt-8 border-t pt-6">
              <label className="text-muted-foreground mb-2 block text-[10px] font-bold tracking-wider uppercase">
                Observações do Prontuário
              </label>
              <div className="border-border text-muted-foreground bg-card rounded-lg border p-4 text-sm leading-relaxed break-words italic">
                {apenado.observations || 'Nenhuma observação registrada até o momento.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
