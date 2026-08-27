import { useMemo, useState } from 'react'
import { FileText, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

import { useSession } from '@/features/authentication/context/sessionContext'
import { ApenadoCreateDialog } from '@/features/convicteds/components/ConvictedCreateDialog'
import { ApenadoDeactivateDialog } from '@/features/convicteds/components/ConvictedDeactivateDialog'
import { ApenadoDocumentsDialog } from '@/features/convicteds/components/ConvictedDocumentsDialog'
import { ApenadoEditDialog } from '@/features/convicteds/components/ConvictedEditDialog'
import { useApenados } from '@/features/convicteds/hooks/useConvicteds'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

const ITEMS_PER_PAGE = 10

function maskCPF(cpf) {
  return (cpf || '').replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

function SitTrabalhista({ sit }) {
  const normalized =
    sit === 'working_formal' || sit === 'registrado' || sit === 'Trabalho Registrado'
      ? 'Trabalho Registrado'
      : sit === 'working_informal' || sit === 'informal' || sit === 'Trabalho Informal'
        ? 'Trabalho Informal'
        : 'Nao Trabalha'

  const variants = {
    'Trabalho Registrado':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:ring-emerald-800',
    'Trabalho Informal':
      'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:ring-blue-800',
    'Nao Trabalha':
      'bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800/80 dark:text-gray-400 dark:ring-gray-700',
  }

  return (
    <span
      className={cn(
        'inline-flex h-6.5 w-36 items-center justify-center rounded-md px-2.5 text-center text-xs font-semibold whitespace-nowrap ring-1 transition-all select-none',
        variants[normalized] || 'bg-muted text-muted-foreground ring-border dark:bg-muted/50'
      )}
    >
      {normalized}
    </span>
  )
}

export default function Convicteds() {
  const { session } = useSession()
  const comarcaId = session?.tenant?.id ? String(session.tenant.id) : '1'

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [apenadoEditar, setApenadoEditar] = useState(null)
  const [apenadoInativar, setApenadoInativar] = useState(null)
  const [apenadoDocumentos, setApenadoDocumentos] = useState(null)

  const { apenados, atualizar, filtrar, processCounts } = useApenados(comarcaId)

  const filtered = useMemo(() => filtrar(search, 'todos'), [filtrar, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE)

  const handleInativar = () => {
    if (!apenadoInativar) return
    const atualizados = apenados.map((item) =>
      item.id === apenadoInativar.id ? { ...item, status: 'Inativo' } : item
    )
    atualizar(atualizados)
    setApenadoInativar(null)
    toast.success('Apenado inativado com sucesso!')
  }

  const handleSalvarNovo = (novo) => {
    atualizar([...apenados, novo])
    setModalCadastroAberto(false)
    toast.success('Apenado cadastrado com sucesso!')
  }

  const handleSalvarEdicao = (editado) => {
    const atualizados = apenados.map((item) => (item.id === editado.id ? editado : item))
    atualizar(atualizados)
    setApenadoEditar(null)
    toast.success('Apenado atualizado com sucesso!')
  }

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
    <div className="space-y-5">
      {modalCadastroAberto && (
        <ApenadoCreateDialog
          open
          tenantId={comarcaId}
          onOpenChange={setModalCadastroAberto}
          onSave={handleSalvarNovo}
        />
      )}
      {apenadoEditar && (
        <ApenadoEditDialog
          key={apenadoEditar.id}
          apenado={apenadoEditar}
          onOpenChange={(aberto) => {
            if (!aberto) setApenadoEditar(null)
          }}
          onSave={handleSalvarEdicao}
        />
      )}
      <ApenadoDeactivateDialog
        apenado={apenadoInativar}
        onOpenChange={(aberto) => {
          if (!aberto) setApenadoInativar(null)
        }}
        onConfirm={handleInativar}
      />
      <ApenadoDocumentsDialog
        apenado={apenadoDocumentos}
        onOpenChange={(aberto) => {
          if (!aberto) setApenadoDocumentos(null)
        }}
      />

      <PageHeader
        title="Gestão de Apenados"
        description="Cadastro e gerenciamento de apenados"
        action={
          <Button
            size="sm"
            className="w-full cursor-pointer gap-2 sm:w-auto sm:min-w-40"
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
              processCount={processCounts[apenado.processNumber] || 0}
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
                <th className="text-foreground w-16 px-4 py-3 text-left text-xs font-semibold">
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
                <th className="text-foreground w-44 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Sit. Trabalhista
                </th>
                <th className="text-foreground w-28 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => {
                const procNum = a.processNumber || '-'
                const count = processCounts[procNum] || 0
                return (
                  <tr key={a.id} className="hover:bg-muted/50 border-b transition-colors">
                    <td className="w-16 px-4 py-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage
                          src={a.referencePhotoUrl || `https://i.pravatar.cc/150?u=${a.id}`}
                          alt={a.fullName}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {(a.fullName || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="min-w-36 px-4 py-3.5">
                      <p className="text-foreground font-semibold">{a.fullName}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(a.cpf)}</p>
                    </td>
                    <td className="text-muted-foreground w-44 px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-foreground block max-w-36 truncate font-medium"
                          title={procNum}
                        >
                          {procNum}
                        </span>
                        {count > 1 && (
                          <span
                            title={`${count} apenados vinculados a este processo`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
                          >
                            <Users className="size-3" />
                            <span>{count}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-muted-foreground w-36 px-4 py-3.5 whitespace-nowrap">
                      {a.phone}
                    </td>
                    <td
                      className="text-muted-foreground max-w-56 min-w-44 truncate px-4 py-3.5"
                      title={a.address}
                    >
                      {a.address}
                    </td>
                    <td className="w-44 px-4 py-3.5 whitespace-nowrap">
                      <SitTrabalhista sit={a.workingStatus} />
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
                )
              })}
            </tbody>
          </table>
        </div>
      </DataTableCard>
    </div>
  )
}

function ApenadoMobileCard({ apenado, processCount, onEdit, onInactivate, onView }) {
  const procNum = apenado.processNumber || '-'
  return (
    <article className="border-border bg-card space-y-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={apenado.referencePhotoUrl || `https://i.pravatar.cc/150?u=${apenado.id}`}
            alt={apenado.fullName}
          />
          <AvatarFallback className="text-sm font-semibold">
            {(apenado.fullName || 'A').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-foreground truncate font-semibold">{apenado.fullName}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(apenado.cpf)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm min-[420px]:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">Telefone</dt>
          <dd className="mt-0.5 font-medium">{apenado.phone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Situação trabalhista</dt>
          <dd className="mt-1">
            <SitTrabalhista sit={apenado.workingStatus} />
          </dd>
        </div>
        <div className="min-[420px]:col-span-2">
          <dt className="text-muted-foreground text-xs">Processo</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-foreground truncate">{procNum}</span>
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
          <dd className="mt-0.5 font-medium break-words">{apenado.address}</dd>
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
