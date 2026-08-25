import { useSession } from '@/context/sessionContext'
import { IMaskInput } from 'react-imask'
import { Search, Upload, Users, X } from 'lucide-react'
import { useApenadoForm } from '@/hooks/useApenadoForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const SITUACOES = ['Trabalho Registrado', 'Trabalho Informal', 'Nao Trabalha']

function ModalCadastro({ apenado, onSalvar, onCancelar }) {
  const { session } = useSession()
  const comarcaId = session?.tenant?.id

  const {
    isEditing,
    fileRef,
    form,
    errors,
    preview,
    buscandoCep,
    processosDisponiveis,
    procSelecionado,
    outrosApenadosNoProcesso,
    actions,
  } = useApenadoForm(apenado, comarcaId)

  const { handleChange, handleMask, handleFoto, removerFoto, buscarCep, tentarSalvar } = actions

  const inputClass = (field) =>
    `w-full rounded-md border px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 ${
      errors[field]
        ? 'border-destructive ring-destructive/20 ring-3'
        : 'border-input dark:bg-input/30'
    }`

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancelar()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
      >
        <DialogHeader className="flex-row items-start justify-between gap-4 px-6 py-4 text-left">
          <div>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? 'Editar Apenado' : 'Cadastrar Novo Apenado'}
            </DialogTitle>
            <DialogDescription className="mt-1">
              Preencha os dados do apenado no formulário abaixo
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
              <X />
              <span className="sr-only">Fechar modal</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Foto de Reconhecimento <span className="text-destructive">*</span>
          </p>

          <div className="mb-5">
            <div className="mb-4 flex items-start gap-4">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className={`hover:bg-muted flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                    errors.foto ? 'border-destructive' : 'border-border'
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-muted-foreground h-5 w-5" />
                      <span className="text-muted-foreground mt-1 px-1 text-center text-[10px] leading-tight">
                        Adicionar
                      </span>
                    </>
                  )}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={removerFoto}
                    className="bg-destructive absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current.click()}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {preview ? 'Trocar foto' : 'Enviar foto'}
                </Button>
                <span className="text-muted-foreground text-xs">
                  JPG ou PNG, até 5MB. Envio obrigatório.
                </span>
                {errors.foto && (
                  <span className="text-destructive text-xs font-medium">{errors.foto}</span>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFoto}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-nome"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Nome e sobrenome"
                  aria-invalid={errors.nome ? true : undefined}
                  className={inputClass('nome')}
                />
                {errors.nome && <p className="text-destructive mt-0.5 text-xs">{errors.nome}</p>}
              </div>
              <div>
                <Label
                  htmlFor="modal-cpf"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  CPF <span className="text-destructive">*</span>
                </Label>
                <IMaskInput
                  id="modal-cpf"
                  mask="000.000.000-00"
                  value={form.cpf}
                  onAccept={(val) => handleMask('cpf', val)}
                  placeholder="000.000.000-00"
                  className={inputClass('cpf')}
                />
                {errors.cpf && <p className="text-destructive mt-0.5 text-xs">{errors.cpf}</p>}
              </div>
              <div>
                <Label
                  htmlFor="modal-nascimento"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Data de Nascimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-nascimento"
                  type="date"
                  name="dataNascimento"
                  value={form.dataNascimento}
                  onChange={handleChange}
                  aria-invalid={errors.dataNascimento ? true : undefined}
                  className={inputClass('dataNascimento')}
                />
                {errors.dataNascimento && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.dataNascimento}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="modal-telefone"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <IMaskInput
                  id="modal-telefone"
                  mask="(00) 00000-0000"
                  value={form.telefone}
                  onAccept={(val) => handleMask('telefone', val)}
                  placeholder="(00) 00000-0000"
                  className={inputClass('telefone')}
                />
                {errors.telefone && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.telefone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="border-border mb-5 rounded-lg border p-4">
            <p className="text-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
              Endereço
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-cep"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  CEP <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <IMaskInput
                    id="modal-cep"
                    mask="00000-000"
                    value={form.cep}
                    onAccept={(val) => handleMask('cep', val)}
                    placeholder="00000-000"
                    className={`flex-1 ${inputClass('cep')}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={buscarCep}
                    disabled={buscandoCep}
                    className="shrink-0 px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cep && <p className="text-destructive mt-0.5 text-xs">{errors.cep}</p>}
              </div>

              <div className="sm:col-span-4">
                <Label
                  htmlFor="modal-logradouro"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Logradouro <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-logradouro"
                  name="logradouro"
                  value={form.logradouro}
                  onChange={handleChange}
                  placeholder="Rua, Avenida..."
                  className={inputClass('logradouro')}
                />
                {errors.logradouro && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.logradouro}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-numero"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Número <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-numero"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="123"
                  className={inputClass('numero')}
                />
                {errors.numero && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.numero}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-complemento"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Complemento
                </Label>
                <Input
                  id="modal-complemento"
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                  placeholder="Apto, bloco..."
                  className={inputClass('complemento')}
                />
              </div>

              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-bairro"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Bairro <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-bairro"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className={inputClass('bairro')}
                />
                {errors.bairro && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.bairro}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label
                  htmlFor="modal-cidade"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-cidade"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className={inputClass('cidade')}
                />
                {errors.cidade && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.cidade}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-uf"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  UF <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-uf"
                  name="uf"
                  value={form.uf}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                  className={inputClass('uf')}
                />
                {errors.uf && <p className="text-destructive mt-0.5 text-xs">{errors.uf}</p>}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="border-border mb-5 space-y-4 rounded-lg border p-4">
            <p className="text-foreground text-xs font-semibold tracking-widest uppercase">
              Dados Processuais e Laborais
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="modal-processoId"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Número do Processo <span className="text-destructive">*</span>
                </Label>
                <select
                  id="modal-processoId"
                  name="processoId"
                  value={form.processoId}
                  onChange={handleChange}
                  className={inputClass('processoId')}
                >
                  <option value="">Selecione o processo</option>
                  {processosDisponiveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.processNumber} {p.court || p.vara ? `(${p.court || p.vara})` : ''}
                    </option>
                  ))}
                </select>
                {errors.processoId && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.processoId}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="modal-sit"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Situação Trabalhista <span className="text-destructive">*</span>
                </Label>
                <select
                  id="modal-sit"
                  name="sitTrabalhista"
                  value={form.sitTrabalhista}
                  onChange={handleChange}
                  className={inputClass('sitTrabalhista')}
                >
                  <option value="">Selecione</option>
                  {SITUACOES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.sitTrabalhista && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.sitTrabalhista}</p>
                )}
              </div>
            </div>

            {outrosApenadosNoProcesso.length > 0 && (
              <div className="border-border bg-card flex items-start gap-3 rounded-lg border p-3.5 text-sm shadow-xs">
                <Users className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="text-muted-foreground text-xs leading-relaxed">
                  <span>
                    Este processo já possui {outrosApenadosNoProcesso.length} apenado(s)
                    vinculado(s):
                  </span>
                  <p className="text-foreground my-0.5 font-semibold">
                    {outrosApenadosNoProcesso.join(', ')}
                  </p>
                  <span>. O cadastro será registrado como corréu no mesmo processo.</span>
                </div>
              </div>
            )}

            {form.processoId && procSelecionado && (
              <div className="border-border/60 bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Instituição/Unidade: </span>
                  <span className="text-foreground font-semibold">
                    {procSelecionado.institution || 'Não informada'}
                  </span>
                </div>
                {(procSelecionado.court || procSelecionado.vara) && (
                  <div>
                    <span className="text-muted-foreground">Vara: </span>
                    <span className="text-foreground font-semibold">
                      {procSelecionado.court || procSelecionado.vara}
                    </span>
                  </div>
                )}
                {procSelecionado.penaltyType && (
                  <div>
                    <span className="text-muted-foreground">Pena: </span>
                    <span className="text-foreground font-semibold">
                      {procSelecionado.penaltyType}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="my-5" />

          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Observações
          </p>
          <div className="mb-2">
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Adicione observações relevantes sobre o apenado..."
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3"
            />
          </div>
        </div>

        <div className="border-border mt-auto flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">* campos obrigatórios</p>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              className="rounded-lg px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => tentarSalvar(onSalvar)}
              disabled={!isEditing && !form.foto && !preview}
              className="rounded-lg px-5"
            >
              {isEditing ? 'Salvar' : 'Salvar cadastro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalCadastro
