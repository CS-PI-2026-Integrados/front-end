import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

  const handleCpfChange = (e) => {
    setCpf(formatCpf(e.target.value));
  };

  return (
    <form className="login-form">

      <div className="fiel-group">
        <label htmlFor="cpf" className="field-label">CPF</label>
        <input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={handleCpfChange}
          className="field-input"
        // autoComplete="username"
        />
      </div>

      <div className="fiel-group">
        <div className="fiel-label-row">
          <label htmlFor="Senha" className="fiel-label">Senha</label>
          <a href="#" className="forgot-link">Esqueceu a senha?</a>
        </div>
        <div className="password-wrapper">
          <input
            id="password"
            type="text"
            inputMode="text"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input password-input"
          // autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {/* {showPassword ? (<EyeOffIcon />) : (<EyeIcon />)} */}
          </button>
        </div>
      </div>

      <button type="button" className="btn-entrar" onClick={handleSubmit}>
        Entrar
      </button>
    </form>
  )
}
