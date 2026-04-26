import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm({ className, ...props }) {

  // validação
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cpf === '000.000.000-00' && password === '123456') {
      console.log('Login realizado com sucesso!');
      navigate('/home');
    } else {
      alert('Credenciais inválidas.');
    }
  };

  const formatCpf = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>

      <div>
        <label htmlFor="cpf" className="text-lg text-gray-600">CPF</label>
        <input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          className="w-full border-2 rounded-[8px] px-3 py-4 text-sm outline-none 
          border-gray-400 text-black placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-500 
          focus:border-emerald-500"
        // autoComplete="username"
        />
      </div>

      <div>
        <div className="flex justify-between">
          <label htmlFor="Senha" className="text-lg text-gray-600">Senha</label>
          <a href="#" className="text-sm text-emerald-500 hover:text-emerald-700">Esqueceu a senha?</a>
        </div>
        <div className="relative mt-1">
          <input
            id="password"
            type="text"
            inputMode="text"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 rounded-[8px] px-3 py-4 text-sm outline-none 
            border-gray-400 text-black placeholder:text-gray-300 focus:ring-2 focus:ring-emerald-500 
            focus:border-emerald-500"
          // autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
          >
            {showPassword ? (
              <EyeOff size={24} strokeWidth={1.5}/>
            ) : (
              <Eye size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-green-600/90 rounded-[8px] px-3 py-4 text-lg 
        text-white hover:ring-2 hover:ring-emerald-700"
      >
        Entrar
      </button>
    </form>
  )
}