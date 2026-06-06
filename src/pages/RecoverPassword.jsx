import authBg from '@/assets/backgrounds/auth-bg.png'
import { AuthBackgroundLayout } from '@/components/auth/AuthBackgroundLayout'
import { AuthFormCard } from '@/components/auth/AuthFormCard'
import { RecoverPasswordForm } from '@/components/auth/RecoverPasswordForm'
import React from 'react'

const RecoverPassword = () => {
  return (
    <AuthBackgroundLayout
      backgroundImage={authBg}
      // overlayClassName={'absolute inset-0 bg-linear-to-b from-emerald-900/50 to-green-900/30'}
    >
      <div className="flex flex-1 items-center justify-center">
        <AuthFormCard>
          <RecoverPasswordForm />
        </AuthFormCard>
      </div>
    </AuthBackgroundLayout>
  )
}

export default RecoverPassword
