import { useState } from 'react'

import { ProcessoCloseConfirmDialog } from '@/features/convicteds/components/ProcessCloseConfirmDialog'
import { ProcessoCard } from '@/features/convicteds/components/ProcessCard'
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

function novoProcesso(apenadoId) {
  return {
    id: crypto.randomUUID(),
    apenadoId,
    numeroProcesso: '',
    vara: '',
    tipoPena: '',
    situacao: 'ativo',
  }
}

function processosIniciais(apenado) {
  return apenado.processos?.length ? apenado.processos : [novoProcesso(apenado.id)]
}

export function ApenadoEditDialog({ apenado, onSave, onOpenChange }) {
  const [form, setForm] = useState(apenado)
  const [processos, setProcessos] = useState(() => (apenado ? processosIniciais(apenado) : []))
  const [erros, setErros] = useState([])
  const [indexParaEncerrar, setIndexParaEncerrar] = useState(null)

  if (!apenado || !form) return null
  const ativos = processos.filter((processo) => processo.situacao === 'ativo').length

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function validar() {
    const proximosErros = processos.map((processo, indice) => {
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
      ) {
        erro.numeroProcesso = 'Número de processo já vinculado a este apenado.'
      }
      return erro
    })
    setErros(proximosErros)
    return proximosErros.every((erro) => Object.keys(erro).length === 0)
  }

  function salvar() {
    if (!validar()) return
    onSave({ ...form, processos, situacao: ativos > 0 ? 'ativo' : 'inativo' })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={Boolean(apenado)} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar apenado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Nome completo
              <Input
                className="mt-1"
                value={form.nomeCompleto}
                onChange={(e) => atualizarCampo('nomeCompleto', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              CPF
              <Input
                className="mt-1"
                value={form.cpf}
                onChange={(e) => atualizarCampo('cpf', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Telefone
              <Input
                className="mt-1"
                value={form.telefone}
                onChange={(e) => atualizarCampo('telefone', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Endereço
              <Input
                className="mt-1"
                value={form.endereco}
                onChange={(e) => atualizarCampo('endereco', e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Situação trabalhista
              <Select
                value={form.situacaoTrabalhista}
                onValueChange={(value) => atualizarCampo('situacaoTrabalhista', value)}
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
              Situação atual
              <Input className="mt-1" readOnly value={ativos > 0 ? 'Ativo' : 'Inativo'} />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Observações
              <Textarea
                className="mt-1"
                value={form.observacoes || ''}
                onChange={(e) => atualizarCampo('observacoes', e.target.value)}
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
                errors={erros[index]}
                onChange={(indice, valor) =>
                  setProcessos((lista) => lista.map((item, i) => (i === indice ? valor : item)))
                }
                onEncerrar={(index) => setIndexParaEncerrar(index)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setProcessos((lista) => [...lista, novoProcesso(apenado.id)])}
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
        onOpenChange={(open) => {
          if (!open) setIndexParaEncerrar(null)
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
