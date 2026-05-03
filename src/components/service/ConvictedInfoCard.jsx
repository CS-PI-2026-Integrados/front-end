import { useState } from 'react'
import { Pencil, Info } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ConvictedInfoCard({ apenado }) {
  const [canEdit, setCanEdit] = useState(false)

  // Pegamos o primeiro processo para exibir de forma simplificada por enquanto
  // Se o apenado puder ter vários, você pode querer mudar isso depois para um select de processos
  const processoAtivo =
    apenado.processos && apenado.processos.length > 0 ? apenado.processos[0] : null

  return (
    <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
      {processoAtivo ? (
        <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-sm wrap-break-word">
          <p>
            <span className="text-muted-foreground">Processo:</span> {processoAtivo.processNumber}
          </p>
          <p>
            <span className="text-muted-foreground">Situação:</span> {processoAtivo.judicialStatus}
          </p>
          <p>
            <span className="text-muted-foreground">Instituição:</span> {processoAtivo.institution}
          </p>
        </div>
      ) : (
        <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-center text-sm">
          <p className="text-muted-foreground">Nenhum processo vinculado a este apenado.</p>
        </div>
      )}

      <div className="flex items-start gap-2 pt-2 md:items-center">
        <Checkbox
          id="enableEditing"
          checked={canEdit}
          onCheckedChange={setCanEdit}
          className="mt-1 shrink-0 md:mt-0"
        />
        <Label
          htmlFor="enableEditing"
          className="flex cursor-pointer items-center gap-2 text-sm leading-relaxed font-medium md:leading-none"
        >
          <Pencil className="h-4 w-4 shrink-0" />
          Habilitar edição dos dados para este comprovante
        </Label>
      </div>

      <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="editPhone">Telefone</Label>
          <Input
            id="editPhone"
            disabled={!canEdit}
            placeholder="(00) 00000-0000"
            defaultValue={apenado.phone}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editAddress">Endereço</Label>
          <Input
            id="editAddress"
            disabled={!canEdit}
            placeholder="Rua, número..."
            defaultValue={apenado.address}
          />
        </div>

        <div className="space-y-2">
          <Label>Situação Trabalhista</Label>
          <Select disabled={!canEdit} defaultValue="nao-trabalha">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trabalha">Trabalha</SelectItem>
              <SelectItem value="nao-trabalha">Não Trabalha</SelectItem>
              <SelectItem value="autonomo">Autônomo</SelectItem>
            </SelectContent>
          </Select>
          {!canEdit && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Marque a opcao acima para editar os dados antes de gerar o comprovante.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
