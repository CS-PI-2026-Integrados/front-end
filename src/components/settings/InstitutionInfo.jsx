import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Field = ({ label, placeholder }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input placeholder={placeholder} />
  </div>
)

export const InstitutionInfo = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">Informações da Instituição</CardTitle>
        <CardDescription>Dados que aparecem nos documentos oficiais</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field label="Nome da Instituição" placeholder="Ex: Tribunal de Justiça do Estado" />
        <Field label="Unidade" placeholder="Ex: Unidade Central" />
        <Field label="Endereço" placeholder="Rua, número, bairro, cidade" />

        <Button className="bg-primary text-white">Salvar Alterações</Button>
      </CardContent>
    </Card>
  )
}

export default InstitutionInfo
