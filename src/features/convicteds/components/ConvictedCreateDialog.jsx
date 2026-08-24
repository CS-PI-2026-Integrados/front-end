import { useState } from 'react'

import { ProcessoCard } from '@/features/convicteds/components/ProcessCard'
import { ProcessoCloseConfirmDialog } from '@/features/convicteds/components/ProcessCloseConfirmDialog'
import { validateCPF } from '@/shared/lib/cpf'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

const formularioVazio = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  endereco: '',
  instituicao: '',
  situacaoTrabalhista: 'naoTrabalha',
  observacoes: '',
  fotoUrl: '',
}
const criarProcesso = () => ({
  id: crypto.randomUUID(),
  numeroProcesso: '',
  vara: '',
  tipoPena: '',
  situacao: 'ativo',
})

export function ApenadoCreateDialog({ open, tenantId, onSave, onOpenChange }) {
  const [form, setForm] = useState(formularioVazio)
  const [processos, setProcessos] = useState([criarProcesso()])
  const [erros, setErros] = useState({})
  const [errosProcessos, setErrosProcessos] = useState([])
  const [indexParaEncerrar, setIndexParaEncerrar] = useState(null)

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }
  function carregarFoto(event) {
    const arquivo = event.target.files?.[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = () => atualizar('fotoUrl', String(leitor.result))
    leitor.readAsDataURL(arquivo)
  }
  function validar() {
    const proximos = {}
    if (!form.nomeCompleto.trim()) proximos.nomeCompleto = 'Informe o nome completo.'
    if (!validateCPF(form.cpf)) proximos.cpf = 'Informe um CPF válido.'
    if (!form.telefone.trim()) proximos.telefone = 'Informe o telefone.'
    if (!form.fotoUrl) proximos.fotoUrl = 'Envie uma foto.'
    const processosComErro = processos.map((processo, indice) => {
      const erro = {}
      if (!processo.numeroProcesso.trim())
        erro.numeroProcesso = 'O número do processo é obrigatório.'
      if (!processo.vara) erro.vara = 'A vara é obrigatória.'
      if (!processo.tipoPena) erro.tipoPena = 'O tipo de pena é obrigatória.'
      if (
        processos.some(
          (outro, outroIndice) =>
            outroIndice !== indice && outro.numeroProcesso.trim() === processo.numeroProcesso.trim()
        )
      )
        erro.numeroProcesso = 'Número duplicado.'
      return erro
    })
    setErros(proximos)
    setErrosProcessos(processosComErro)
    return (
      Object.keys(proximos).length === 0 &&
      processosComErro.every((erro) => Object.keys(erro).length === 0)
    )
  }
  function salvar() {
    if (!validar()) return
    const id = crypto.randomUUID()
    onSave({
      ...form,
      id,
      tenantId,
      situacao: 'ativo',
      processos: processos.map((processo) => ({ ...processo, tenantId, apenadoId: id })),
    })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Cadastrar apenado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Nome completo
              <Input
                className="mt-1"
                value={form.nomeCompleto}
                onChange={(e) => atualizar('nomeCompleto', e.target.value)}
              />
              {erros.nomeCompleto && (
                <span className="text-destructive text-xs">{erros.nomeCompleto}</span>
              )}
            </label>
            <label className="text-sm font-medium">
              CPF
              <Input
                className="mt-1"
                value={form.cpf}
                onChange={(e) => atualizar('cpf', e.target.value)}
              />
              {erros.cpf && <span className="text-destructive text-xs">{erros.cpf}</span>}
            </label>
            <label className="text-sm font-medium">
              Telefone
              <Input
                className="mt-1"
                value={form.telefone}
                onChange={(e) => atualizar('telefone', e.target.value)}
              />
              {erros.telefone && <span className="text-destructive text-xs">{erros.telefone}</span>}
            </label>
            <label className="text-sm font-medium">
              Data de nascimento
              <Input
                className="mt-1"
                type="date"
                value={form.dataNascimento}
                onChange={(e) => atualizar('dataNascimento', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Instituição
              <Input
                className="mt-1"
                value={form.instituicao}
                onChange={(e) => atualizar('instituicao', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Endereço
              <Input
                className="mt-1"
                value={form.endereco}
                onChange={(e) => atualizar('endereco', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Situação trabalhista
              <Select
                value={form.situacaoTrabalhista}
                onValueChange={(value) => atualizar('situacaoTrabalhista', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrado">Trabalho registrado</SelectItem>
                  <SelectItem value="informal">Trabalho informal</SelectItem>
                  <SelectItem value="naoTrabalha">Não trabalha</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="text-sm font-medium">
              Foto
              <Input className="mt-1" type="file" accept="image/*" onChange={carregarFoto} />
              {erros.fotoUrl && <span className="text-destructive text-xs">{erros.fotoUrl}</span>}
            </label>
            {form.fotoUrl && (
              <img
                src={form.fotoUrl}
                alt="Prévia da foto"
                className="size-20 rounded-md object-cover"
              />
            )}
            <label className="text-sm font-medium sm:col-span-2">
              Observações
              <Textarea
                className="mt-1"
                value={form.observacoes}
                onChange={(e) => atualizar('observacoes', e.target.value)}
              />
            </label>
          </div>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Processos vinculados</h3>
            {processos.map((processo, index) => (
              <ProcessoCard
                key={processo.id}
                processo={processo}
                index={index}
                errors={errosProcessos[index]}
                onChange={(indice, valor) =>
                  setProcessos((lista) => lista.map((item, i) => (i === indice ? valor : item)))
                }
                onEncerrar={(index) => setIndexParaEncerrar(index)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setProcessos((lista) => [...lista, criarProcesso()])}
            >
              Adicionar processo
            </Button>
          </section>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvar}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProcessoCloseConfirmDialog
        open={indexParaEncerrar !== null}
        onOpenChange={(valor) => {
          if (!valor) setIndexParaEncerrar(null)
        }}
        onConfirm={() => {
          setProcessos((lista) =>
            lista.map((processo, index) =>
              index === indexParaEncerrar ? { ...processo, situacao: 'encerrado' } : processo
            )
          )
          setIndexParaEncerrar(null)
        }}
      />
    </>
  )
}
