import { useEffect, useMemo, useState, useCallback } from 'react'
import { FileText, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'

import { convictedService } from '@/features/convicteds/services/convictedService'
import { useSession } from '@/features/authentication/context/sessionContext'
import { ApenadoCreateDialog } from '@/features/convicteds/components/ConvictedCreateDialog'
import { ApenadoDeactivateDialog } from '@/features/convicteds/components/ConvictedDeactivateDialog'
import { ApenadoDocumentsDialog } from '@/features/convicteds/components/ConvictedDocumentsDialog'
import { ApenadoEditDialog } from '@/features/convicteds/components/ConvictedEditDialog'
import { useApenados } from '@/features/convicteds/hooks/mockedUseConvicteds'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'

const ITEMS_PER_PAGE = 10

function maskCPF(cpf) {
  return (cpf || '').replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

function SitTrabalhista({ sit }) {
  const map = {
    working_formal: 'Trabalho Registrado',
    working_informal: 'Trabalho Informal',
    not_working: 'Não Trabalha',
  }
  const normalized = map[sit] || 'Não Trabalha'

  const variants = {
    'Trabalho Registrado':
      'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:ring-emerald-800',
    'Trabalho Informal':
      'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/80 dark:text-blue-400 dark:ring-blue-800',
    'Não Trabalha':
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
  const [search, setSearch] = useState('')
  const [list, setList] = useState([])
  const [actualPage, setActualPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [lastPage, setLastPage] = useState(1)

  const loadList = useCallback(async () => {
    return convictedService.list({
      search,
      page: actualPage,
    })
  }, [search, actualPage])

  useEffect(() => {
    const load = async () => {
      const response = await loadList()

      setList(response.content)
      setTotalItems(response.total_elements)
      setLastPage(response.total_pages)
    }

    load()
  }, [loadList])

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
              setActualPage(1)
            }}
            className="pl-9"
          />
        </div>
      </FiltersPanel>

      <DataTableCard
        title="Apenados Cadastrados"
        count={totalItems}
        icon={<Users className="text-muted-foreground size-5" />}
        /* vibe codas - Ao chegar na última página o footer (e também o botão de listar página não é encontrado), tive mockar isEmpty = false para evitar esse bug */
        // isEmpty={list.length === 0}
        isEmpty={false}
        emptyState={
          <EmptyTableState
            title={
              actualPage > 1
                ? 'Nenhum apenado encontrado nesta página'
                : 'Nenhum apenado encontrado'
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
              Página {actualPage} de {lastPage}
            </span>
            <div className="flex w-full justify-between gap-1.5 sm:w-auto sm:justify-start">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setActualPage(actualPage - 1)}
                disabled={actualPage === 1}
              >
                Anterior
              </Button>
              <div className="hidden gap-1.5 sm:flex">
                <Button size="xs" disabled={true}>
                  {actualPage}
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
                onClick={() => setActualPage(actualPage + 1)}
                disabled={actualPage === lastPage}
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
          <Table className="w-full min-w-[700px] text-sm">
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
              {list.map((item) => {
                return (
                  <TableRow key={item.id} className="hover:bg-muted/50 border-b transition-colors">
                    <TableCell className="w-16 px-4 py-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage src={item.photo_url} alt={item.name} />
                        <AvatarFallback className="text-xs font-semibold">
                          {(item.name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="min-w-36 px-4 py-3.5">
                      <p className="text-foreground font-semibold">{item.name}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">{item.cpf}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground w-44 px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-foreground block max-w-36 truncate font-medium"
                          title={item.main_process_number}
                        >
                          {item.main_process_number}
                        </span>
                        {item.same_process_convicted_count > 1 && (
                          <span
                            title={`${item.same_process_convicted_count} apenados vinculados a este processo`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/80 dark:text-blue-400"
                          >
                            <Users className="size-3" />
                            <span>{item.same_process_convicted_count}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground w-36 px-4 py-3.5 whitespace-nowrap">
                      {item.phone || '-'}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground max-w-56 min-w-44 truncate px-4 py-3.5"
                      title={item.address}
                    >
                      {/* {a.address} */}-
                    </TableCell>
                    <TableCell className="w-44 px-4 py-3.5 whitespace-nowrap">
                      {/* <SitTrabalhista sit={} /> */}-
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
