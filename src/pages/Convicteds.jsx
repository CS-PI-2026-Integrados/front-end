import { useState, useMemo, useEffect } from 'react'
import { Ban, Eye, Pencil, Plus, Search, Users } from 'lucide-react'
import { useSession } from '@/context/sessionContext'
import mockApenados from '../mocks/apenados.json'
import ModalInative from '../components/hooks/modalInative'
import ModalEditar from '../components/hooks/modalEditar'
import ModalCadastro from '../components/hooks/modalCadastro'
import ModalDocumentosApenado from '../components/hooks/modalDocumentosApenado'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { DataTableCard } from '@/components/data-display/DataTableCard'
import { EmptyTableState } from '@/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/components/data-display/FiltersPanel'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ITEMS_PER_PAGE = 10
const STORAGE_KEY = 'apenados_data_v4'

function getStoredApenados() {
  const salvo = localStorage.getItem(STORAGE_KEY)

  if (!salvo) return mockApenados

  try {
    const parsed = JSON.parse(salvo)

    return Array.isArray(parsed) ? parsed : mockApenados
  } catch {
    return mockApenados
  }
}

function maskCPF(cpf) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

function StatusBadge({ status }) {
  const variants = {
    Ativo: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    Inativo: 'bg-gray-100 text-gray-500 ring-gray-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ${variants[status] || variants.Inativo}`}
    >
      {status === 'Inativo' ? 'Inativo' : 'Ativo'}
    </span>
  )
}

function SitTrabalhista({ sit }) {
  const variants = {
    'Trabalho Registrado': 'bg-blue-100 text-blue-700 ring-blue-200',
    'Trabalho Informal': 'bg-orange-100 text-orange-700 ring-orange-200',
    'Nao Trabalha': 'bg-gray-100 text-gray-500 ring-gray-200',
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
  const navigate = useNavigate()
  const comarca = session?.tenant?.id

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [apenados, setApenados] = useState(getStoredApenados)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apenados))
  }, [apenados])

  const [apenadoInativar, setApenadoInativar] = useState(null)
  const [apenadoEditar, setApenadoEditar] = useState(null)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [apenadoDocumentos, setApenadoDocumentos] = useState(null)

  const filtered = useMemo(() => {
    if (!comarca) return []
    const term = search.toLowerCase().trim()

    return apenados
      .filter((item) => item.tenant_id === comarca)
      .filter((a) => {
        const matchStatus = statusFilter === 'Todos' || a.status === statusFilter
        if (!matchStatus) return false

        if (!term) return true

        const matchNome = a.nome.toLowerCase().includes(term)

        const cleanCPF = a.cpf.replace(/\D/g, '')
        const cleanTerm = term.replace(/\D/g, '')
        const matchCPF = cleanTerm !== '' && cleanCPF.includes(cleanTerm)

        return matchNome || matchCPF
      })
  }, [comarca, search, statusFilter, apenados])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE)

  function handleInativar() {
    setApenados((prev) =>
      prev.map((a) => (a.id === apenadoInativar.id ? { ...a, status: 'Inativo' } : a))
    )
    setApenadoInativar(null)
    toast.success('Apenado inativado com sucesso!')
  }

  function handleSalvar(form) {
    setApenados((prev) => prev.map((a) => (a.id === form.id ? { ...form } : a)))
    setApenadoEditar(null)
  }

  function handleCadastrar(novoApenado) {
    setApenados((prev) => [...prev, novoApenado])
    setModalCadastroAberto(false)
    toast.success('Apenado cadastrado com sucesso!')
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
      <ModalInative
        apenado={apenadoInativar}
        onConfirmar={handleInativar}
        onCancelar={() => setApenadoInativar(null)}
      />
      <ModalEditar
        key={apenadoEditar?.id}
        apenado={apenadoEditar}
        onSalvar={handleSalvar}
        onCancelar={() => setApenadoEditar(null)}
      />
      {modalCadastroAberto && (
        <ModalCadastro
          onSalvar={handleCadastrar}
          onCancelar={() => setModalCadastroAberto(false)}
        />
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
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="hover:bg-muted w-full cursor-pointer lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
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
              onEdit={() => setApenadoEditar(apenado)}
              onInactivate={() => setApenadoInativar(apenado)}
              onView={() => setApenadoDocumentos(apenado)}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-210 text-sm">
            <thead>
              <tr className="bg-secondary border-y">
                {['Nome', 'Telefone', 'Endereço', 'Sit. Trabalhista', 'Status', 'Ações'].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-foreground px-4 py-3 text-left text-xs font-semibold whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-muted/50 border-b transition-colors">
                  <td className="min-w-40 px-4 py-3.5">
                    <p className="text-foreground font-semibold">{a.nome}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(a.cpf)}</p>
                  </td>
                  <td className="text-muted-foreground px-4 py-3.5 whitespace-nowrap">
                    {a.telefone}
                  </td>
                  <td
                    className="text-muted-foreground max-w-64 truncate px-4 py-3.5"
                    title={a.endereco}
                  >
                    {a.endereco}
                  </td>
                  <td className="px-4 py-3.5">
                    <SitTrabalhista sit={a.sit_trabalhista} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        title="Visualizar"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setApenadoDocumentos(a)}
                      >
                        <Eye />
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
                        title="Inativar"
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => setApenadoInativar(a)}
                      >
                        <Ban />
                        <span className="sr-only">Inativar</span>
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

function ApenadoMobileCard({ apenado, onEdit, onInactivate, onView }) {
  return (
    <article className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-foreground truncate font-semibold">{apenado.nome}</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">{maskCPF(apenado.cpf)}</p>
        </div>
        <StatusBadge status={apenado.status} />
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
          <dt className="text-muted-foreground text-xs">Endereço</dt>
          <dd className="mt-0.5 font-medium break-words">{apenado.endereco}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          <Eye /> Ver
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil /> Editar
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onInactivate}>
          <Ban /> Inativar
        </Button>
      </div>
    </article>
  )
}

export default Convicteds
