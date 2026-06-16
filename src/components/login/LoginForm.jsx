import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { useLogin } from '@/hooks/useLogin'

export function LoginForm() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    formatCpf,
    showPassword,
    togglePasswordVisibility,
    authError,
    signIn,
  } = useLogin()

  const inputBaseStyles =
    'h-13 w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 disabled:bg-gray-100 disabled:opacity-70'
  const inputDefaultStyles =
    'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'
  const inputErrorStyles =
    'border-red-500 focus-visible:ring-red-500 focus-visible:ring-2 focus-visible:border-red-500'

  const { onChange: onCpfChange, ...restCpfRegister } = register('cpf')

  return (
    <form className="space-y-6" onSubmit={handleSubmit(signIn)}>
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
            autoComplete="username"
            {...restCpfRegister}
            onChange={(e) => {
              e.target.value = formatCpf(e.target.value)
              onCpfChange(e)
            }}
            disabled={isSubmitting}
            className={`${inputBaseStyles} ${errors.cpf || authError ? inputErrorStyles : inputDefaultStyles} `}
          />
          <span className="mt-1 block min-h-5 text-sm text-red-500">
            {errors.cpf?.message || authError || ''}
          </span>
        </Field>

        <Field className="gap-1">
          <div className="flex justify-between">
            <FieldLabel htmlFor="password" className="text-lg font-normal text-gray-600">
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
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password')}
              className={`${inputBaseStyles} ${errors.password || authError ? inputErrorStyles : inputDefaultStyles} `}
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={togglePasswordVisibility}
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

        <Button
          type="submit"
          disabled={!isValid}
          className={`mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
            !isValid || isSubmitting
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'bg-primary cursor-pointer hover:ring-emerald-700'
          } `}
        >
          {isSubmitting ? <Loader2 className="animate-spin text-white" size={24} /> : 'Entrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
