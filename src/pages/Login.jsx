import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/ui/login-form'

const Login = () => {

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
    <div className="login-page">
      <div className="login-left">

        <span className="login-brand">SICAPE</span>
        <p className="login-tagline">
          A prova de fraudes, a favor da sua comarca.
        </p>

      </div>

      <div className="login-right">
        <div className="login-form-wrapper">

          <span className="login-logo">login-logo</span>

          <LoginForm />

        </div>
      </div >
    </div >
  );
};

export default Login;
