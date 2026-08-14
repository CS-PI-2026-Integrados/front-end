import { useMemo, useState } from 'react'
import { Ban, FileText, Pencil, Plus, Search, Users } from 'lucide-react'
import toast from 'react-hot-toast'

import { useSession } from '@/features/autenticacao/context/sessionContext'
import { ApenadoCreateDialog } from '@/features/apenados/components/ApenadoCreateDialog'
import { ApenadoDeactivateDialog } from '@/features/apenados/components/ApenadoDeactivateDialog'
import { ApenadoDocumentsDialog } from '@/features/apenados/components/ApenadoDocumentsDialog'
import { ApenadoEditDialog } from '@/features/apenados/components/ApenadoEditDialog'
import { rotuloSituacaoApenado, rotuloSituacaoTrabalhista } from '@/features/apenados/model/apenado'
import { useApenados } from '@/features/apenados/hooks/useApenados'
import { Button } from '@/shared/ui/button'
import { DataTableCard } from '@/shared/ui/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/ui/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/ui/data-display/FiltersPanel'
import { PageHeader } from '@/shared/ui/data-display/PageHeader'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const POR_PAGINA = 10
function cpfMascarado(cpf) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

export default function Convicteds() {
  const { session } = useSession()
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [novoAberto, setNovoAberto] = useState(false)
  const [editar, setEditar] = useState(null)
  const [inativar, setInativar] = useState(null)
  const [documentos, setDocumentos] = useState(null)
  const tenantId = String(session?.tenant?.id || '')
  const { apenados, atualizar } = useApenados(tenantId)

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const cpfTermo = termo.replace(/\D/g, '')
    return apenados
      .filter((apenado) => apenado.tenantId === tenantId)
      .filter(
        (apenado) =>
          (situacao === 'todos' || apenado.situacao === situacao) &&
          (!termo ||
            apenado.nomeCompleto.toLowerCase().includes(termo) ||
            (cpfTermo && apenado.cpf.replace(/\D/g, '').includes(cpfTermo)))
      )
  }, [apenados, busca, situacao, tenantId])
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaVisivel = Math.min(pagina, totalPaginas)
  const exibidos = filtrados.slice((paginaVisivel - 1) * POR_PAGINA, paginaVisivel * POR_PAGINA)
  const atualizarFiltros = (acao) => {
    acao()
    setPagina(1)
  }

  return (
    <div className="bg-background min-h-screen space-y-5 px-4 py-5 sm:px-6">
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
              item.id === inativar.id ? { ...item, situacao: 'inativo' } : item
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
          <Button size="sm" onClick={() => setNovoAberto(true)}>
            <Plus />
            Novo apenado
          </Button>
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
              onEdit={() => setEditar(apenado)}
              onDeactivate={() => setInativar(apenado)}
              onDocuments={() => setDocumentos(apenado)}
            />
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-210 text-sm">
            <thead>
              <tr className="bg-secondary border-y">
                {['Nome', 'Telefone', 'Endereço', 'Situação trabalhista', 'Status', 'Ações'].map(
                  (coluna) => (
                    <th key={coluna} className="px-4 py-3 text-left text-xs font-semibold">
                      {coluna}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {exibidos.map((apenado) => (
                <tr key={apenado.id} className="hover:bg-muted/50 border-b">
                  <td className="px-4 py-3">
                    <strong>{apenado.nomeCompleto}</strong>
                    <span className="text-muted-foreground block text-xs">
                      {cpfMascarado(apenado.cpf)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{apenado.telefone}</td>
                  <td className="max-w-64 truncate px-4 py-3">{apenado.endereco}</td>
                  <td className="px-4 py-3">
                    {rotuloSituacaoTrabalhista(apenado.situacaoTrabalhista)}
                  </td>
                  <td className="px-4 py-3">{rotuloSituacaoApenado(apenado.situacao)}</td>
                  <td className="px-4 py-3">
                    <Acoes
                      onDocuments={() => setDocumentos(apenado)}
                      onEdit={() => setEditar(apenado)}
                      onDeactivate={() => setInativar(apenado)}
                    />
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
function ApenadoMobileCard({ apenado, onEdit, onDeactivate, onDocuments }) {
  return (
    <article className="space-y-3 p-4">
      <div>
        <strong>{apenado.nomeCompleto}</strong>
        <span className="text-muted-foreground block text-xs">{cpfMascarado(apenado.cpf)}</span>
      </div>
      <p className="text-sm">
        {apenado.telefone} · {rotuloSituacaoApenado(apenado.situacao)}
      </p>
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
