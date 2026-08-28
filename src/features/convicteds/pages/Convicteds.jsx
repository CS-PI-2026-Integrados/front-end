import { useMemo, useState } from 'react'
import { Ban, FileText, Pencil, Plus, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { useSession } from '@/features/authentication/context/sessionContext'
import { ApenadoCreateDialog } from '@/features/convicteds/components/ConvictedCreateDialog'
import { ApenadoDeactivateDialog } from '@/features/convicteds/components/ConvictedDeactivateDialog'
import { ApenadoDocumentsDialog } from '@/features/convicteds/components/ConvictedDocumentsDialog'
import { ApenadoEditDialog } from '@/features/convicteds/components/ConvictedEditDialog'
import { useApenados } from '@/features/convicteds/hooks/useConvicteds'
import { Button } from '@/shared/components/ui/button'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'

const POR_PAGINA = 10

export default function Convicteds() {
  const navigate = useNavigate()
  const { session } = useSession()
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [novoAberto, setNovoAberto] = useState(false)
  const [editar, setEditar] = useState(null)
  const [inativar, setInativar] = useState(null)
  const [documentos, setDocumentos] = useState(null)
  const tenantId = String(session?.tenant?.id || '')
  const { apenados, atualizar } = useApenados()

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const cpfTermo = termo.replace(/\D/g, '')
    return apenados.filter(
      (apenado) =>
        (situacao === 'todos' || apenado.status?.toLowerCase() === situacao) &&
        (!termo ||
          apenado.name.toLowerCase().includes(termo) ||
          (cpfTermo && apenado.cpf.replace(/\D/g, '').includes(cpfTermo)))
    )
  }, [apenados, busca, situacao])
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaVisivel = Math.min(pagina, totalPaginas)
  const exibidos = filtrados.slice((paginaVisivel - 1) * POR_PAGINA, paginaVisivel * POR_PAGINA)
  const atualizarFiltros = (acao) => {
    acao()
    setPagina(1)
  }
  const abrirPerfil = (id) => navigate(`/apenados/${id}`)

  return (
    <div className="space-y-5">
      {novoAberto && (
        <ApenadoCreateDialog
          open
          tenantId={tenantId}
          onOpenChange={setNovoAberto}
          onSave={(apenado) => {
            atualizar([...apenados, apenado])
            toast.success('Apenado cadastrado com sucesso.')
          }}
        />
      )}
      {editar && (
        <ApenadoEditDialog
          key={editar.id}
          apenado={editar}
          onOpenChange={(aberto) => {
            if (!aberto) setEditar(null)
          }}
          onSave={(apenado) =>
            atualizar(apenados.map((item) => (item.id === apenado.id ? apenado : item)))
          }
        />
      )}
      <ApenadoDeactivateDialog
        apenado={inativar}
        onOpenChange={(aberto) => {
          if (!aberto) setInativar(null)
        }}
        onConfirm={() => {
          atualizar(
            apenados.map((item) =>
              item.id === inativar.id ? { ...item, status: 'inativo' } : item
            )
          )
          setInativar(null)
          toast.success('Apenado inativado com sucesso.')
        }}
      />
      <ApenadoDocumentsDialog
        apenado={documentos}
        onOpenChange={(aberto) => {
          if (!aberto) setDocumentos(null)
        }}
      />
      <PageHeader
        title="Gestão de Apenados"
        description="Cadastro e gerenciamento de apenados"
        action={
          <HeaderButton icon={Plus} text="Novo apenado" onClick={() => setNovoAberto(true)} />
        }
      />
      <FiltersPanel description="Pesquise e filtre os apenados cadastrados">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou CPF"
            value={busca}
            onChange={(event) => atualizarFiltros(() => setBusca(event.target.value))}
          />
        </div>
        <Select
          value={situacao}
          onValueChange={(valor) => atualizarFiltros(() => setSituacao(valor))}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </FiltersPanel>
      <DataTableCard
        title="Apenados cadastrados"
        count={filtrados.length}
        icon={<Users className="text-muted-foreground size-5" />}
        isEmpty={filtrados.length === 0}
        emptyState={
          <EmptyTableState
            title="Nenhum apenado encontrado"
            description={
              busca
                ? `Não há resultados para "${busca}".`
                : 'Não há apenados cadastrados com esses filtros.'
            }
          />
        }
        footer={
          totalPaginas > 1 && (
            <div className="flex justify-end gap-2 border-t p-3">
              <Button
                size="sm"
                variant="outline"
                disabled={paginaVisivel === 1}
                onClick={() => setPagina((atual) => atual - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={paginaVisivel === totalPaginas}
                onClick={() => setPagina((atual) => atual + 1)}
              >
                Próxima
              </Button>
            </div>
          )
        }
      >
        <div className="divide-y md:hidden">
          {exibidos.map((apenado) => (
            <ApenadoMobileCard
              key={apenado.id}
              apenado={apenado}
              onOpen={() => abrirPerfil(apenado.id)}
              onEdit={() => setEditar(apenado)}
              onDeactivate={() => setInativar(apenado)}
              onDocuments={() => setDocumentos(apenado)}
            />
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <Table className="min-w-210 text-sm">
            <TableHeader>
              <TableRow className="bg-secondary border-y">
                {['Nome', 'Telefone', 'Endereço', 'Situação trabalhista', 'Status', 'Ações'].map(
                  (coluna) => (
                    <TableHead key={coluna} className="px-4 py-3 text-left text-xs font-semibold">
                      {coluna}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exibidos.map((apenado) => (
                <TableRow
                  key={apenado.id}
                  className="hover:bg-muted/50 cursor-pointer border-b"
                  onClick={() => abrirPerfil(apenado.id)}
                >
                  <TableCell className="px-4 py-3">
                    <strong>{apenado.name}</strong>
                    <span className="text-muted-foreground block text-xs">{apenado.cpf}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3">—</TableCell>
                  <TableCell className="max-w-64 truncate px-4 py-3">—</TableCell>
                  <TableCell className="px-4 py-3">—</TableCell>
                  <TableCell className="px-4 py-3">—</TableCell>
                  <TableCell className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <Acoes
                      onDocuments={() => setDocumentos(apenado)}
                      onEdit={() => setEditar(apenado)}
                      onDeactivate={() => setInativar(apenado)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DataTableCard>
    </div>
  )
}

function Acoes({ onDocuments, onEdit, onDeactivate }) {
  return (
    <div className="flex gap-1">
      <Button title="Documentos" variant="ghost" size="icon-sm" onClick={onDocuments}>
        <FileText />
      </Button>
      <Button title="Editar" variant="ghost" size="icon-sm" onClick={onEdit}>
        <Pencil />
      </Button>
      <Button title="Inativar" variant="destructive" size="icon-sm" onClick={onDeactivate}>
        <Ban />
      </Button>
    </div>
  )
}
function ApenadoMobileCard({ apenado, onOpen, onEdit, onDeactivate, onDocuments }) {
  return (
    <article className="space-y-3 p-4">
      <div onClick={onOpen} className="cursor-pointer">
        <strong>{apenado.name}</strong>
        <span className="text-muted-foreground block text-xs">{apenado.cpf}</span>
      </div>
      <p className="text-sm">—</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onDocuments}>
          Documentos
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button size="sm" variant="destructive" onClick={onDeactivate}>
          Inativar
        </Button>
      </div>
    </article>
  )
}
