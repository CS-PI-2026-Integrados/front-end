import { Routes, Route } from 'react-router-dom'
import { AtendimentoProvider } from '@/features/atendimento'
import Service from '@/features/atendimento/pages/Service'
import Settings from '@/features/configuracoes/pages/Settings'
import Login from '@/features/autenticacao/pages/Login'
import Groups from '@/features/grupos-reflexivos/pages/Groups'
import Dashboard from '@/features/dashboard/pages/Dashboard'
import Convicteds from '@/features/apenados/pages/Convicteds'
import Institutions from '@/features/instituicoes/pages/Institutions'
import Certificate from '@/features/certificados/pages/Certificate'
import NotFound from '@/pages/NotFound'
import DashboardLayout from '@/app/layouts/DashboardLayout'
import ApenadoProfile from '@/features/apenados/pages/ApenadoProfile'
import AuthGuard from '@/app/guards/AuthGuard'
import GuestGuard from '@/app/guards/GuestGuard'
import RecoverPassword from '@/features/autenticacao/pages/RecoverPassword'
import DefinePassword from '@/features/autenticacao/pages/DefinePassword'
import UsersManagement from '@/features/usuarios/pages/UsersManagement'
import RoleGuard from '@/app/guards/RoleGuard'
import MustChangePasswordGuard from '@/app/guards/MustChangePasswordGuard'
import { canAccessUsersPage } from '@/features/usuarios/model/userPermissions'
import GroupManagement from '@/features/grupos-reflexivos/pages/GroupManagement'

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<GuestGuard />}>
        <Route path="login" element={<Login />} />
        <Route path="recuperar-senha" element={<RecoverPassword />} />
      </Route>

      <Route path="definir-senha" element={<DefinePassword />} />

      <Route element={<AuthGuard />}>
        <Route element={<MustChangePasswordGuard />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="grupos-reflexivos" element={<Groups />} />
            <Route path="grupos-reflexivos/:id" element={<GroupManagement />} />
            <Route path="apenados" element={<Convicteds />} />
            <Route
              path="atendimento"
              element={
                <AtendimentoProvider>
                  <Service />
                </AtendimentoProvider>
              }
            />
            <Route path="instituicoes" element={<Institutions />} />
            <Route path="comprovante" element={<Certificate />} />
            <Route path="apenados/:id" element={<ApenadoProfile />} />
            <Route path="configuracoes" element={<Settings />} />
            <Route element={<RoleGuard canAccess={canAccessUsersPage} />}>
              <Route path="usuarios" element={<UsersManagement />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
