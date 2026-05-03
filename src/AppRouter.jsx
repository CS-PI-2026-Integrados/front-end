import React, { useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { useSession } from './context/SessionContext'
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
      console.log('session:', session)
    }
  }, [session])

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path='/dashboard' element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="apenados" element={<Convicteds />} />
        <Route path="instituicoes" element={<Institutions />} />
        <Route path="comprovante" element={<Certificate />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
