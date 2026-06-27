import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PasswordField = ({ label }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input type="password" />
  </div>
)

export const PasswordChange = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>Configurações de segurança e acesso</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PasswordField label="Senha Atual" />
        <PasswordField label="Nova Senha" />
        <PasswordField label="Confirmar Nova Senha" />

        <Button className="bg-green-700 text-white hover:bg-green-800">Alterar Senha</Button>
      </CardContent>
    </Card>
  )
}

export default PasswordChange
