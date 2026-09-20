import { Eye, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvictedList } from '@/features/convicteds/hooks/useConvictedList'
import { useConvictedDetail } from '@/features/convicteds/hooks/useConvictedDetail'
import { ConvictedDeactivateDialog } from '@/features/convicteds/components/ConvictedDeactivateDialog'
import { ConvictedFormDialog } from '@/features/convicteds/components/ConvictedFormDialog'
import { AuthenticatedConvictedImage } from '@/features/convicteds/components/AuthenticatedConvictedImage'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import { Pagination } from '@/shared/components/ui/pagination'
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'
import { formatAddress } from '../utils/convictedUtils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export default function Convicteds() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deactivating, setDeactivating] = useState(null)
  const { error, isLoading, items, totalItems, totalPages, refetch } = useConvictedList({
    search,
    page,
    limit: 5,
  })
  const { convicted: editingConvicted, isLoading: isLoadingDetail } = useConvictedDetail(editingId)

  const openCreate = () => {
    setEditingId(null)
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setFormOpen(true)
  }

  const closeForm = (open) => {
    setFormOpen(open)
    if (!open) setEditingId(null)
  }

  const handleFormSuccess = () => {
    closeForm(false)
    refetch()
  }

  const handleDeactivateSuccess = () => {
    setDeactivating(null)
    refetch()
  }

  return (
    <div className="space-y-5">
      {formOpen && (!editingId || !isLoadingDetail) && (
        <ConvictedFormDialog
          open
          convicted={editingId ? editingConvicted : null}
          onOpenChange={closeForm}
          onSuccess={handleFormSuccess}
        />
      )}
      <ConvictedDeactivateDialog
        convicted={deactivating}
        open={Boolean(deactivating)}
        onOpenChange={(open) => {
          if (!open) setDeactivating(null)
        }}
        onSuccess={handleDeactivateSuccess}
      />

      <PageHeader
        title="Gestão de Apenados"
        description="Cadastro e gerenciamento de apenados"
        action={<HeaderButton icon={Plus} text="Novo apenado" onClick={openCreate} />}
      />

      <FiltersPanel description="Pesquise e filtre os apenados cadastrados">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, CPF ou processo..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </FiltersPanel>

      <DataTableCard
        title="Apenados Cadastrados"
        count={totalItems}
        icon={<Users className="text-muted-foreground size-5" />}
        isLoading={isLoading}
        isEmpty={Boolean(error) || items.length === 0}
        emptyState={
          <EmptyTableState
            title={
              error ||
              (page > 1 ? 'Nenhum apenado encontrado nesta página' : 'Nenhum apenado encontrado')
            }
            description={
              search
                ? `Não há resultados para "${search}". Tente outro termo.`
                : 'Não há apenados cadastrados com esses filtros.'
            }
          />
        }
        footer={
          <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium">
              Página {page} de {totalPages} · {totalItems} registros
            </span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        }
      >
        <div className="overflow-x-auto md:block">
          <Table className="w-full min-w-225 table-fixed text-sm">
            <colgroup>
              <col className="w-16" />
              <col className="w-64" />
              <col className="w-52" />
              <col className="w-40" />
              <col className="w-72" />
              <col className="w-32" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-secondary border-y">
                <TableHead className="text-foreground w-16 px-4 py-3 text-left text-xs font-semibold">
                  Foto
                </TableHead>
                <TableHead className="text-foreground min-w-36 px-4 py-3 text-left text-xs font-semibold">
                  Nome
                </TableHead>
                <TableHead className="text-foreground w-44 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Processo
                </TableHead>
                <TableHead className="text-foreground w-36 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Telefone
                </TableHead>
                <TableHead className="text-foreground min-w-44 px-4 py-3 text-left text-xs font-semibold">
                  Endereço
                </TableHead>
                <TableHead className="text-foreground w-32 px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const address = formatAddress(item.address)

                return (
                  <TableRow key={item.id} className="hover:bg-muted/50 border-b transition-colors">
                    <TableCell className="w-16 px-4 py-3">
                      <Avatar className="size-9 shrink-0">
                        <AuthenticatedConvictedImage
                          as={AvatarImage}
                          id={item.id}
                          alt={item.fullName}
                          className="size-full object-cover"
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {(item.fullName || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="min-w-36 px-4 py-3.5">
                      <p className="text-foreground font-semibold">{item.fullName}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{item.cpf}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground w-44 px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-foreground block max-w-36 truncate font-medium"
                          title={item.mainProcessNumber}
                        >
                          {item.mainProcessNumber}
                        </span>
                        {item.sameProcessConvictedCount > 1 && (
                          <span
                            title={`${item.sameProcessConvictedCount} apenados vinculados a este processo`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
                          >
                            <Users className="size-3" />
                            <span>{item.sameProcessConvictedCount}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground w-36 px-4 py-3.5 whitespace-nowrap">
                      {item.phone || '-'}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground max-w-56 min-w-44 truncate px-4 py-3.5"
                      title={address || undefined}
                    >
                      {address || '-'}
                    </TableCell>
                    <TableCell className="w-32 px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          title="Visualizar perfil"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => navigate(`/apenados/${item.id}`)}
                        >
                          <Eye />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          type="button"
                          title="Editar"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          type="button"
                          title="Inativar"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => setDeactivating(item)}
                        >
                          <Trash2 />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </DataTableCard>
    </div>
  )
}
