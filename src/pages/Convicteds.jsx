import { FileText, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { useSession } from '@/context/sessionContext'
import { useConvicteds } from '@/hooks/useConvicteds'
import ModalInative from '../components/hooks/modalInative'
import ModalCadastro from '../components/hooks/modalCadastro'
import ModalDocumentosApenado from '../components/hooks/modalDocumentosApenado'
import { DataTableCard } from '@/components/data-display/DataTableCard'
import { EmptyTableState } from '@/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/components/data-display/FiltersPanel'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function maskCPF(cpf) {
  return (cpf || '').replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

function SitTrabalhista({ sit }) {
  const variants = {
    'Trabalho Registrado':
      'bg-slate-200 text-slate-900 ring-slate-300 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700',
    'Trabalho Informal':
      'bg-slate-200 text-slate-900 ring-slate-300 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700',
    'Nao Trabalha':
      'bg-slate-200 text-slate-900 ring-slate-300 dark:bg-slate-950 dark:text-muted-foreground dark:ring-slate-700',
  }
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ${variants[sit] || variants['Nao Trabalha']}`}
    >
      {sit}
    </span>
  )
}

const Convicteds = () => {
  const { session } = useSession()
  const comarca = session?.tenant?.id

  const { state, actions } = useConvicteds(comarca)
  const {
    search,
    currentPage,
    apenadoInativar,
    apenadoEditar,
    modalCadastroAberto,
    apenadoDocumentos,
    totalPages,
    visiblePage,
    paginated,
    filtered,
    processCounts,
  } = state
  const {
    setSearch,
    setCurrentPage,
    setApenadoInativar,
    setApenadoEditar,
    setModalCadastroAberto,
    setApenadoDocumentos,
    handleInativar,
    handleSalvar,
  } = actions

  const paginationFooter =
    totalPages > 1 ? (
      <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          Página {visiblePage} de {totalPages}
        </span>
        <div className="flex w-full justify-between gap-1.5 sm:w-auto sm:justify-start">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setCurrentPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
            disabled={visiblePage === 1}
          >
            Anterior
          </Button>
          <div className="hidden gap-1.5 sm:flex">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === visiblePage ? 'default' : 'outline'}
                size="xs"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))}
            disabled={visiblePage === totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    ) : null

  return (
    <div className="bg-background min-h-screen space-y-5 px-4 py-5 sm:px-6">
      <ModalInative
        apenado={apenadoInativar}
        onConfirmar={handleInativar}
        onCancelar={() => setApenadoInativar(null)}
      />
      {apenadoEditar && (
        <ModalCadastro
          key={apenadoEditar.id}
          apenado={apenadoEditar}
          onSalvar={handleSalvar}
          onCancelar={() => setApenadoEditar(null)}
        />
      )}
      {modalCadastroAberto && (
        <ModalCadastro onSalvar={handleSalvar} onCancelar={() => setModalCadastroAberto(false)} />
      )}
      {apenadoDocumentos && (
        <ModalDocumentosApenado
          apenado={apenadoDocumentos}
          onFechar={() => setApenadoDocumentos(null)}
        />
      )}

      <PageHeader
        title="Gestão de Apenados"
        description="Cadastro e gerenciamento de apenados"
        action={
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 w-full cursor-pointer gap-2 px-4 text-sm font-medium shadow-sm sm:w-auto sm:min-w-40"
            onClick={() => setModalCadastroAberto(true)}
          >
            <Plus />
            Novo Apenado
          </Button>
        }
      />

      <FiltersPanel description="Pesquise e filtre os apenados cadastrados">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, CPF ou processo..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
      </FiltersPanel>

      <DataTableCard
        title="Apenados Cadastrados"
        count={filtered.length}
        icon={<Users className="text-muted-foreground size-5" />}
        isEmpty={filtered.length === 0}
        emptyState={
          <EmptyTableState
            title="Nenhum apenado encontrado"
            description={
              search
                ? `Não há resultados para "${search}". Tente outro termo.`
                : 'Não há apenados cadastrados com esses filtros.'
            }
          />
        }
        footer={paginationFooter}
      >
        <div className="divide-y md:hidden">
          {paginated.map((apenado) => (
            <ApenadoMobileCard
              key={apenado.id}
              apenado={apenado}
              processCount={processCounts[apenado.numero_processo] || 0}
              onEdit={() => setApenadoEditar(apenado)}
              onInactivate={() => setApenadoInativar(apenado)}
              onView={() => setApenadoDocumentos(apenado)}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-secondary border-y">
                <th className="text-foreground w-14 px-4 py-3 text-left text-xs font-semibold">
                  Foto
                </th>
                <th className="text-foreground min-w-36 px-4 py-3 text-left text-xs font-semibold">
                  Nome
                </th>
                <th className="text-foreground w-44 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Processo
                </th>
                <th className="text-foreground w-36 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Telefone
                </th>
                <th className="text-foreground min-w-44 px-4 py-3 text-left text-xs font-semibold">
                  Endereço
                </th>
                <th className="text-foreground w-36 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Sit. Trabalhista
                </th>
                <th className="text-foreground w-28 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50 border-b transition-colors">
                  <td className="w-14 px-4 py-3.5">
                    <img
                      src={a.foto || `https://i.pravatar.cc/40?u=${a.id}`}
                      alt={a.nome}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  </td>
                  <td className="min-w-36 px-4 py-3.5">
                    <p className="text-foreground font-semibold">{a.nome}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(a.cpf)}</p>
                  </td>
                  <td className="text-muted-foreground w-44 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-foreground block max-w-36 truncate font-medium"
                        title={a.numero_processo || ''}
                      >
                        {a.numero_processo || '-'}
                      </span>
                      {processCounts[a.numero_processo] > 1 && (
                        <span
                          title={`${processCounts[a.numero_processo]} apenados vinculados a este processo`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
                        >
                          <Users className="size-3" />
                          <span>{processCounts[a.numero_processo]}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-muted-foreground w-36 px-4 py-3.5 whitespace-nowrap">
                    {a.telefone}
                  </td>
                  <td
                    className="text-muted-foreground max-w-56 min-w-44 truncate px-4 py-3.5"
                    title={a.endereco}
                  >
                    {a.endereco}
                  </td>
                  <td className="w-36 px-4 py-3.5">
                    <SitTrabalhista sit={a.sit_trabalhista} />
                  </td>
                  <td className="w-28 px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        title="Documentos"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setApenadoDocumentos(a)}
                      >
                        <FileText />
                        <span className="sr-only">Visualizar</span>
                      </Button>
                      <Button
                        type="button"
                        title="Editar"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setApenadoEditar(a)}
                      >
                        <Pencil />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        type="button"
                        title="Excluir"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => setApenadoInativar(a)}
                      >
                        <Trash2 />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataTableCard>
    </div>
  )
}

function ApenadoMobileCard({ apenado, processCount, onEdit, onInactivate, onView }) {
  return (
    <article className="border-border bg-card space-y-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={apenado.foto || `https://i.pravatar.cc/40?u=${apenado.id}`}
          alt={apenado.nome}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h3 className="text-foreground truncate font-semibold">{apenado.nome}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(apenado.cpf)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">Telefone</dt>
          <dd className="mt-0.5 font-medium">{apenado.telefone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Situação trabalhista</dt>
          <dd className="mt-1">
            <SitTrabalhista sit={apenado.sit_trabalhista} />
          </dd>
        </div>
        <div className="min-[420px]:col-span-2">
          <dt className="text-muted-foreground text-xs">Processo</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-foreground truncate">{apenado.numero_processo || '-'}</span>
            {processCount > 1 && (
              <span
                title={`${processCount} apenados vinculados a este processo`}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
              >
                <Users className="size-3" />
                <span>{processCount}</span>
              </span>
            )}
          </dd>
        </div>
        <div className="min-[420px]:col-span-2">
          <dt className="text-muted-foreground text-xs">Endereço</dt>
          <dd className="mt-0.5 font-medium break-words">{apenado.endereco}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          <FileText /> Docs
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil /> Editar
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onInactivate}>
          <Trash2 /> Excluir
        </Button>
      </div>
    </article>
  )
}

export default Convicteds
