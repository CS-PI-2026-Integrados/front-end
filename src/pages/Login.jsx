import { LoginForm } from '@/components/ui/login-view'
import loginBg from '../assets/images/login-bg.jpg'
import logoWhite from '../assets/images/logo-white.png'
import logo from '../assets/images/logo.png'
import React from 'react'

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
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-green-900/30"></div>

        <img
          src={logoWhite}
          alt="Logo white"
          className="relative z-10 w-20"
        />

        <div className="relative z-10 [mask-image:linear-gradient(to_bottom_right,black_20%,transparent_80%)] [mask-repeat:no-repeat]">
          <h1 className="font-serif text-7xl text-white/90">
            Gestão <br />
            inteligente <br />
            para você.
          </h1>
        </div>

      </div>

      {/* right side */}
      <div className="flex w-full items-center justify-center bg-white lg:w-1/2">
        <div className="w-full max-w-[480px] space-y-8 px-6">

          <div className='flex justify-center m-0'>
            <img
              src={logo}
              alt="Logo"
              className="h-28 w-28 object-contain"
            />
          </div>

          <LoginForm />

        </div>

      </div >

    </div >
  );
};

export default Login;