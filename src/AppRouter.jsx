import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSession } from './context/SessionContext'
import Service from './pages/Service'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Convicteds from './pages/Convicteds'
import Institutions from './pages/Institutions'
import Certificate from './pages/Certificate'
import NotFound from './pages/NotFound'
import DashboardLayout from './layout/DashboardLayout'

const AppRouter = () => {
  const { session } = useSession()

  useEffect(() => {
    if (session !== null) {
      console.log('Usuário logado/Sessão ativa:', session)
    }
  }, [session])

  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="apenados" element={<Convicteds />} />
        <Route path="atendimento" element={<Service />} />
        <Route path="instituicoes" element={<Institutions />} />
        <Route path="comprovante" element={<Certificate />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
