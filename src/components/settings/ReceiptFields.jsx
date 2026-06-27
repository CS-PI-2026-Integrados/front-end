import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const FieldRow = ({ title, description }) => (
  <div className="flex items-center justify-between rounded-lg border p-4">
    <div className="space-y-0.5">
      <div className="text-base font-medium">{title}</div>
      <div className="text-muted-foreground text-sm">{description}</div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Checkbox id={`visible-${title}`} />
        <Label htmlFor={`visible-${title}`} className="cursor-pointer text-sm">
          Visivel
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`editable-${title}`} />
        <Label htmlFor={`editable-${title}`} className="cursor-pointer text-sm">
          Editavel
        </Label>
      </div>
    </div>
  </div>
)

export const ReceiptFields = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">Campos do Comprovante</CardTitle>
        <CardDescription>
          Configure quais campos sao visiveis e editaveis na geracao de comprovantes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <FieldRow title="Telefone" description="Numero de telefone do apenado" />
        <FieldRow title="Endereço" description="Endereço completo do apenado" />
        <FieldRow title="Situação Trabalhista" description="Status de trabalho do apenado" />
      </CardContent>
    </Card>
  )
}

export default ReceiptFields
