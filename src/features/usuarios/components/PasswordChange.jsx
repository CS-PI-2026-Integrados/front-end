import { useState, useCallback } from 'react'
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import toast from 'react-hot-toast'
import { useSession } from '@/features/autenticacao/context/sessionContext'
import { changePassword } from '@/features/autenticacao/services/authService'
import { PasswordStrengthMeter } from '@/features/autenticacao/components/PasswordStrengthMeter'
import { obterForcaSenha } from '@/features/autenticacao/components/passwordStrength'

const PasswordField = ({ label, value, onChange, error }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
    />
    {error && <p className="text-destructive text-sm font-medium">{error}</p>}
  </div>
)

export const PasswordChange = () => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })
  const [errors, setErrors] = useState({})
  const { session } = useSession()

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    const newErrors = {}

    if (!formData.senhaAtual.trim()) {
      newErrors.senhaAtual = 'Senha atual é obrigatória'
    }

    if (!formData.novaSenha.trim()) {
      newErrors.novaSenha = 'Nova senha é obrigatória'
    } else {
      const strength = obterForcaSenha(formData.novaSenha)
      if (strength.score < 2) {
        newErrors.novaSenha = 'A senha é muito fraca'
      }
    }

    if (!formData.confirmarSenha.trim()) {
      newErrors.confirmarSenha = 'Confirmação é obrigatória'
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Corrija os erros antes de salvar')
      return
    }

    const doChange = async () => {
      try {
        if (!session) throw new Error('Sessão inválida')

        await changePassword(session, formData.senhaAtual, formData.novaSenha)

        setErrors({})
        setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
        toast.success('Senha alterada com sucesso')
      } catch (err) {
        const msg = err?.message || 'Erro ao alterar senha'
        toast.error(msg)
      }
    }

    doChange()
  }, [formData, session])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">Segurança</CardTitle>
        <CardDescription>Configurações de segurança e acesso</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PasswordField
          label="Senha Atual"
          value={formData.senhaAtual}
          onChange={(v) => handleChange('senhaAtual', v)}
          error={errors.senhaAtual}
        />
        <PasswordField
          label="Nova Senha"
          value={formData.novaSenha}
          onChange={(v) => handleChange('novaSenha', v)}
          error={errors.novaSenha}
        />
        <PasswordStrengthMeter password={formData.novaSenha} />
        <PasswordField
          label="Confirmar Nova Senha"
          value={formData.confirmarSenha}
          onChange={(v) => handleChange('confirmarSenha', v)}
          error={errors.confirmarSenha}
        />

        <Button
          onClick={handleSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Alterar Senha
        </Button>
      </CardContent>
    </Card>
  )
}

export default PasswordChange
