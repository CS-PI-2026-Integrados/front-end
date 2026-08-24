import { Routes, Route } from 'react-router-dom'
import { AtendimentoProvider } from '@/features/attendance'
import Service from '@/features/attendance/pages/Receipts'
import Settings from '@/features/settings/pages/Settings'
import Login from '@/features/authentication/pages/Login'
import Groups from '@/features/reflection-group/pages/Groups'
import Dashboard from '@/features/dashboard/pages/Dashboard'
import Convicteds from '@/features/convicteds/pages/Convicteds'
import Institutions from '@/features/institutions/pages/Institutions'
import Certificate from '@/features/certificates/pages/Certificate'
import NotFound from '@/features/not-found/pages/NotFound'
import DashboardLayout from '@/app/layouts/DashboardLayout'
import ApenadoProfile from '@/features/convicteds/pages/ConvictedProfile'
import AuthGuard from '@/app/guards/AuthGuard'
import GuestGuard from '@/app/guards/GuestGuard'
import RecoverPassword from '@/features/authentication/pages/RecoverPassword'
import DefinePassword from '@/features/authentication/pages/DefinePassword'
import UsersManagement from '@/features/users/pages/UsersManagement'
import RoleGuard from '@/app/guards/RoleGuard'
import MustChangePasswordGuard from '@/app/guards/MustChangePasswordGuard'
import { canAccessUsersPage } from '@/features/users/utils/userPermissionsUtils'
import GroupManagement from '@/features/reflection-group/pages/GroupManagement'

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
