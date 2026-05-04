import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const mock_users = [{ id: 1, cpf: '096.767.219.80', password: 'admin' }]

const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || !!digits.match(/^(\d)\1+$/)) return false

  const calcDigit = (slice, factor) => {
    let sum = 0
    for (const char of slice) {
      sum += parseInt(char) * factor--
    }
    const result = (sum * 10) % 11
    return result >= 10 ? 0 : result
  }

  const digit1 = calcDigit(digits.slice(0, 9), 10)
  const digit2 = calcDigit(digits.slice(0, 10), 11)

  return digit1 === parseInt(digits[9]) && digit2 === parseInt(digits[10])
}

const loginSchema = z.object({
  cpf: z.string().min(14, 'Preencha o CPF completo').refine(validateCPF, 'CPF inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const onSubmit = (data) => {
    // data.cpf e data.password já chegam validados aqui
    if (data.password === '123456') {
      console.log('Login realizado com sucesso!')
      navigate('/tenant/dashboard')
    } else {
      alert('Credenciais inválidas.')
    }
  }

  const formatCpf = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }

  const { onChange: onCpfChange, ...restCpfRegister } = register('cpf')

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* O que isso significa? */}

      <div>
        <label htmlFor="cpf" className="text-lg text-gray-600">
          CPF
        </label>
        <input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          {...restCpfRegister}
          onChange={(e) => {
            e.target.value = formatCpf(e.target.value) // Aplica a máscara visualmente
            onCpfChange(e) // Envia o valor mascarado para o React Hook Form
          }}
          className={`w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 ${errors.cpf ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'} `}
        />
        {errors.cpf && (
          <span className="mt-1 block text-sm text-red-500">{errors.cpf.message}</span>
        )}
      </div>

      <div>
        <div className="flex justify-between">
          <label htmlFor="Senha" className="text-lg text-gray-600">
            Senha
          </label>
          <a href="#" className="text-sm text-emerald-500 hover:text-emerald-700">
            Esqueceu a senha?
          </a>
        </div>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            inputMode="text"
            placeholder="Digite sua senha"
            {...register('password')}
            className={`w-full rounded-[8px] border-2 px-3 py-4 pr-12 text-sm text-black transition-colors outline-none placeholder:text-gray-300 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'} `}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff size={24} strokeWidth={1.5} />
            ) : (
              <Eye size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="mt-1 block text-sm text-red-500">{errors.password.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className={`w-full rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
          isValid
            ? 'cursor-pointer bg-green-600/90 hover:ring-2 hover:ring-emerald-700'
            : 'cursor-not-allowed bg-gray-400 opacity-70'
        } `}
      >
        Entrar
      </button>
    </form>
  )
}
