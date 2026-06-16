import { Routes, Route } from 'react-router-dom'
import Service from '@/pages/Service'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Convicteds from '@/pages/Convicteds'
import Institutions from '@/pages/Institutions'
import Certificate from '@/pages/Certificate'
import NotFound from '@/pages/NotFound'
import DashboardLayout from '@/layout/DashboardLayout'
import ApenadoProfile from '@/pages/ApenadoProfile'
import AuthGuard from '@/components/guards/AuthGuard'
import GuestGuard from '@/components/guards/GuestGuard'

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<GuestGuard />}>
        <Route path="login" element={<Login />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apenados" element={<Convicteds />} />
          <Route path="atendimento" element={<Service />} />
          <Route path="instituicoes" element={<Institutions />} />
          <Route path="comprovante" element={<Certificate />} />
          <Route path="apenados/:id" element={<ApenadoProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
