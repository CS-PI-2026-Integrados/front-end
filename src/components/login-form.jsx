import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { formatCpf } from '@/lib/validadorCpf'
import { loginSchema } from '@/schemas/loginSchema'
import { authenticateUser } from '@/services/loginAuth'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError('')

    try {
      const response = await authenticateUser(data.cpf, data.password)

      localStorage.setItem('@sicape:user', JSON.stringify(response.user))
      localStorage.setItem('@sicape:token', response.token)

      navigate(`/${response.tenant}/dashboard`)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const { onChange: onCpfChange, ...restCpfRegister } = register('cpf')

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-1 p-0">
        <Field className="gap-1">
          <FieldLabel htmlFor="cpf" className="text-lg font-normal text-gray-600">
            CPF
          </FieldLabel>
          <Input
            id="cpf"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            {...restCpfRegister}
            onChange={(e) => {
              e.target.value = formatCpf(e.target.value)
              onCpfChange(e)
            }}
            disabled={isLoading}
            className={`h-13 w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 ${errors.cpf || authError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'} ${isLoading ? 'bg-gray-100 opacity-70' : 'bg-white'} `}
          />
          <span className="mt-1 block min-h-5 text-sm text-red-500">
            {errors.cpf?.message || authError || ''}
          </span>
        </Field>

        <FieldGroup className="p-0">
          <Field className="gap-1">
            <div className="flex justify-between">
              <FieldLabel htmlFor="Senha" className="text-lg font-normal text-gray-600">
                Senha
              </FieldLabel>
              <a href="#" className="text-sm text-emerald-500 hover:text-emerald-700">
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                inputMode="text"
                placeholder="Digite sua senha"
                disabled={isLoading}
                {...register('password')}
                className={`h-13 w-full rounded-[8px] border-2 px-3 py-4 pr-12 text-sm text-black transition-colors outline-none placeholder:text-gray-300 ${errors.password || authError ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'} ${isLoading ? 'bg-gray-100 opacity-70' : 'bg-white'} `}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff size={24} strokeWidth={1.5} />
                ) : (
                  <Eye size={24} strokeWidth={1.5} />
                )}
              </button>
            </div>
            <span className="mt-1 block h-3 min-h-4 text-sm text-red-500">
              {errors.password?.message || authError || ''}
            </span>
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          disabled={!isValid}
          className={`mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
            !isValid || isLoading
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'cursor-pointer bg-green-600/90 hover:ring-2 hover:ring-emerald-700'
          } `}
        >
          {isLoading ? <Loader2 className="animate-spin text-white" size={24} /> : 'Entrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
