import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Checkbox } from '@/shared/ui/checkbox'
import { Switch } from '@/shared/ui/switch'
import { useReceiptConfig } from '@/hooks/useReceiptConfig'

const TOGGLE_LABELS = {
  mostrarFotoReferencia: { title: 'Foto de Referência', desc: 'Exibir foto cadastral do apenado' },
  mostrarFotoAtendimento: {
    title: 'Foto de Atendimento',
    desc: 'Exibir foto capturada no atendimento',
  },
  mostrarCpf: { title: 'CPF', desc: 'Exibir CPF do apenado no comprovante' },
  mostrarProcessoVara: { title: 'Processo / Vara', desc: 'Exibir número do processo e vara' },
  mostrarNomeServidor: { title: 'Nome do Servidor', desc: 'Exibir nome do operador responsável' },
  mostrarAssinaturaDigital: {
    title: 'Assinatura Digital',
    desc: 'Incluir assinatura digital no comprovante',
  },
}

const ToggleRow = ({ title, description, checked, onToggle }) => (
  <div className="flex items-center justify-between rounded-lg border p-4">
    <div className="space-y-0.5">
      <div className="text-base font-medium">{title}</div>
      <div className="text-muted-foreground text-sm">{description}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onToggle} />
  </div>
)

const FieldRow = ({ title, description, visible, editable, onVisibleChange, onEditableChange }) => (
  <div className="flex items-center justify-between rounded-lg border p-4">
    <div className="space-y-0.5">
      <div className="text-base font-medium">{title}</div>
      <div className="text-muted-foreground text-sm">{description}</div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Checkbox id={`visible-${title}`} checked={visible} onCheckedChange={onVisibleChange} />
        <Label htmlFor={`visible-${title}`} className="cursor-pointer text-sm">
          Visível
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`editable-${title}`}
          checked={editable}
          onCheckedChange={onEditableChange}
          disabled={!visible}
        />
        <Label htmlFor={`editable-${title}`} className="cursor-pointer text-sm">
          Editável
        </Label>
      </div>
    </div>
  </div>
)

export const ReceiptFields = () => {
  const { receiptConfig, receiptFields, handleToggle, handleFieldConfig } = useReceiptConfig()

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold">Configurações do Comprovante</CardTitle>
          <CardDescription>
            Escolha quais informações serão exibidas no comprovante gerado
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {Object.entries(TOGGLE_LABELS).map(([key, { title, desc }]) => (
            <ToggleRow
              key={key}
              title={title}
              description={desc}
              checked={receiptConfig[key]}
              onToggle={() => handleToggle(key)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold">Campos do Comprovante</CardTitle>
          <CardDescription>
            Configure quais campos são visíveis e editáveis na geração de comprovantes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {receiptFields.map((field) => (
            <FieldRow
              key={field.key}
              title={field.label}
              description={`${field.label} do apenado`}
              visible={field.visible}
              editable={field.editable}
              onVisibleChange={(checked) => {
                handleFieldConfig(field.key, 'visible', checked)
                if (!checked) {
                  handleFieldConfig(field.key, 'editable', false)
                }
              }}
              onEditableChange={(checked) => handleFieldConfig(field.key, 'editable', checked)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default ReceiptFields
