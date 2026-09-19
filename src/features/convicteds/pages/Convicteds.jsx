import { FileText, Pencil, Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useConvictedList } from '@/features/convicteds/hooks/useConvictedList'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import { formatAddress } from '../utils/convictedUtils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const employmentStatusLabels = {
  FORMAL_WORK: 'Trabalho registrado',
  INFORMAL_WORK: 'Trabalho informal',
  UNEMPLOYED: 'Não trabalha',
}

export default function Convicteds() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { error, isLoading, items, totalItems, totalPages } = useConvictedList({ search, page })

  /* Precisa ser retrabalhado e integrado a API */
  // const { apenados, atualizar } = useApenados(comarcaId)

  // const handleInativar = () => {
  //   if (!apenadoInativar) return
  //   const atualizados = apenados.map((item) =>
  //     item.id === apenadoInativar.id ? { ...item, status: 'Inativo' } : item
  //   )
  //   atualizar(atualizados)
  //   setApenadoInativar(null)
  //   toast.success('Apenado inativado com sucesso!')
  // }

  // const handleSalvarNovo = (novo) => {
  //   atualizar([...apenados, novo])
  //   setModalCadastroAberto(false)
  //   toast.success('Apenado cadastrado com sucesso!')
  // }

  // const handleSalvarEdicao = (editado) => {
  //   const atualizados = apenados.map((item) => (item.id === editado.id ? editado : item))
  //   atualizar(atualizados)
  //   setApenadoEditar(null)
  //   toast.success('Apenado atualizado com sucesso!')
  // }

  return (
    <div className="space-y-5">
      {/* Precisa ser retrabalhado e integrado a API */}
      {/* {modalCadastroAberto && (
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
      )} */}
      {/* <ApenadoDeactivateDialog
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
      /> */}

      <PageHeader
        title="Gestão de Apenados"
        description="Cadastro e gerenciamento de apenados"

        /* Desativo pois precisa ser reconstruido e integrado a API */
        // action={
        //   <HeaderButton
        //     icon={Plus}
        //     text="Novo apenado"
        //     onClick={() => setModalCadastroAberto(true)}
        //   />
        // }
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
            <span>
              Página {page} de {totalPages}
            </span>
            <div className="flex w-full justify-between gap-1.5 sm:w-auto sm:justify-start">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <div className="hidden gap-1.5 sm:flex">
                <Button size="xs" disabled={true}>
                  {page}
                </Button>
                {/* ele cria um botão para cada página existente, se houver 100 páginas, então 100 botões vão ser criados :( componente criado totalmente via vibe code e que não foi testado  */}
                {/* {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === actualPage ? 'default' : 'outline'}
                    size="xs"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))} */}
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        }
      >
        {/* vibe codas - ao invés de construir uma tabela responsiva, a IA construiu duas lógicas de listagem diferentes, uma para celular e outra para computador, sempre construia duas tabelas diferentes e escondia uma delas de acordo com o tamanho da tela */}
        {/* <div className="divide-y md:hidden">
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
        </div> */}

        <div className="overflow-x-auto md:block">
          <Table className="w-full min-w-175 text-sm">
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
                <TableHead className="text-foreground w-44 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                  Sit. Trabalhista
                </TableHead>
                <TableHead className="text-foreground w-28 px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
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
                        <AvatarImage src={item.photoUrl || undefined} alt={item.fullName} />
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
                    <TableCell className="w-44 px-4 py-3.5 whitespace-nowrap">
                      {employmentStatusLabels[item.employmentStatus] || '-'}
                    </TableCell>
                    <TableCell className="w-28 px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          /* desativado propositalmente pois o modal precisa ser reconstruido e integrado a API */
                          disabled={true}
                          type="button"
                          title="Documentos"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setApenadoDocumentos(item)}
                        >
                          <FileText />
                          <span className="sr-only">Visualizar</span>
                        </Button>
                        <Button
                          /* desativado propositalmente pois o modal precisa ser reconstruido e integrado a API */
                          disabled={true}
                          type="button"
                          title="Editar"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setApenadoEditar(item)}
                        >
                          <Pencil />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          /* desativado propositalmente pois o modal precisa ser reconstruido e integrado a API */
                          disabled={true}
                          type="button"
                          title="Excluir"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => setApenadoInativar(item)}
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
