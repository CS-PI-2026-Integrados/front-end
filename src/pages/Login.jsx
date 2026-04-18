import { LoginForm } from '@/components/ui/login-form'
import loginBg from '../assets/images/login-bg.jpg'

const Login = () => {

  return (
    <div className="flex min-h-screen">

      {/* left side */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-15 text-white z-0 lg:flex">

        <img
          src='../assets/images/login-bg.jpg'
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay z-1"
        />

        <div className="absolute inset-0 bg-emerald-900/80 z-2"></div>

        <span className="inset-0 z-3">SICAPE</span>
        <p className="inset-0 z-3">
          A prova de fraudes, a favor da sua comarca.
        </p>

      </div>

      {/* right side */}
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
