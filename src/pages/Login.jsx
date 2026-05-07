import { LoginForm } from '@/components/LoginForm'
import loginBg from '../../public/assets/logo/login-bg.jpg'
import logoWhite from '../../public/assets/logo/to-dark-background.svg'
import React from 'react'
import logo from '../../public/assets/logo/to-light-background.svg'

const Login = () => {
  return (
    <div className="flex min-h-screen">
      <div className="relative z-0 hidden w-1/2 flex-col justify-between bg-zinc-900 p-15 text-white lg:flex">
        <img
          src={loginBg}
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-b from-emerald-900/50 to-green-900/30"></div>

        <img src={logoWhite} alt="Logo white" className="relative z-10 w-20" />

        <div className="relative z-10 mask-[linear-gradient(to_bottom_right,black_20%,transparent_80%)] mask-no-repeat">
          <h1 className="font-serif text-7xl text-white/90">
            Gestão <br />
            inteligente <br />
            para você.
          </h1>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white lg:w-1/2">
        <div className="w-full max-w-120 space-y-8 px-6">
          <div className="m-0 flex justify-center">
            <img src={logo} alt="Logo" className="h-28 w-28 object-contain" />
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default Login
