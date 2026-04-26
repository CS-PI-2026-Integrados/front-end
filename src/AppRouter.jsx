import React, { useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { useComarca } from './context/ComarcaContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Convicteds from './pages/Convicteds'
import Institutions from './pages/Institutions'
import Certificate from './pages/Certificate'
import NotFound from './pages/NotFound'
import DashboardLayout from './layout/DashboardLayout'

const ComarcaRoutes = () => {
  const { tenantId } = useParams()
  const { setComarca } = useComarca()

  useEffect(() => {
    setComarca(tenantId)
    // eslint-disable-next-line no-console
    console.log('comarca:', tenantId)
  }, [tenantId, setComarca])

  return (
    <Routes>
      <Route path='/dashboard' element={<DashboardLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="apenados" element={<Convicteds />} />
        <Route path="instituicoes" element={<Institutions />} />
        <Route path="comprovante" element={<Certificate />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/:tenantId/*" element={<ComarcaRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
