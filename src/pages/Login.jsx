import { LoginForm } from '@/components/ui/login-form'
import loginBg from '../assets/images/login-bg.jpg'
import sicapeLogo from '../assets/images/sicape-logo-white.png'
// import 

const Login = () => {

  return (
    <div className="flex min-h-screen">

      {/* left side */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-15 text-white z-0 lg:flex">

        <img
          src={loginBg}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* <div className="absolute inset-0 bg-emerald-950/30 mix-blend-multiply"></div> */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 to-emerald-900/60"></div>

        <img
          src={sicapeLogo}
          alt="Background"
          className="relative z-10 w-25"
        />

        <div className="relative z-10">
          <h1 className="font-instrument-sans text-6xl">
            Gestão <br />
            inteligente <br />
            para você.
          </h1>
        </div>

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
