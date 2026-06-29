import { useState, useCallback } from 'react'
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const PasswordField = ({ label, value, onChange, error }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? 'border-red-500' : ''}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
)

export const PasswordChange = () => {
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })
  const [errors, setErrors] = useState({})

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
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'Mínimo de 6 caracteres'
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

    // TODO: validar senha atual contra mock/API na UC02
    setErrors({})
    setFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
    toast.success('Senha alterada com sucesso')
  }, [formData])

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
        <PasswordField
          label="Confirmar Nova Senha"
          value={formData.confirmarSenha}
          onChange={(v) => handleChange('confirmarSenha', v)}
          error={errors.confirmarSenha}
        />

        <Button onClick={handleSubmit} className="bg-green-700 text-white hover:bg-green-800">
          Alterar Senha
        </Button>
      </CardContent>
    </Card>
  )
}

export default PasswordChange
