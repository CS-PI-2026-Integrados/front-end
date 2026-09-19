import { Routes, Route } from 'react-router-dom'
import { AtendimentoProvider, ReceiptsPage } from '@/features/attendance'
import { SettingsPage } from '@/features/settings'
import { DefinePasswordPage, LoginPage, RecoverPasswordPage } from '@/features/authentication'
import { GroupManagementPage, GroupsPage } from '@/features/reflection-group'
import { DashboardPage } from '@/features/dashboard'
import { ConvictedProfilePage, ConvictedsPage } from '@/features/convicteds'
import { InstitutionsPage } from '@/features/institutions'
import { CertificatePage } from '@/features/certificates'
import { NotFoundPage } from '@/features/not-found'
import DashboardLayout from '@/app/layouts/DashboardLayout'
import AuthGuard from '@/app/guards/AuthGuard'
import GuestGuard from '@/app/guards/GuestGuard'
import { UsersManagementPage, canAccessUsersPage } from '@/features/users'
import RoleGuard from '@/app/guards/RoleGuard'
import MustChangePasswordGuard from '@/app/guards/MustChangePasswordGuard'
import { DocumentsPage } from '@/features/documents'

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<GuestGuard />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="recuperar-senha" element={<RecoverPasswordPage />} />
      </Route>

      <Route path="definir-senha" element={<DefinePasswordPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<MustChangePasswordGuard />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="grupos-reflexivos" element={<GroupsPage />} />
            <Route path="grupos-reflexivos/:id" element={<GroupManagementPage />} />
            <Route path="apenados" element={<ConvictedsPage />} />
            <Route
              path="atendimento"
              element={
                <AtendimentoProvider>
                  <ReceiptsPage />
                </AtendimentoProvider>
              }
            />
            <Route path="instituicoes" element={<InstitutionsPage />} />
            <Route path="comprovante" element={<CertificatePage />} />
            <Route path="documentos" element={<DocumentsPage />} />
            <Route path="apenados/:id" element={<ConvictedProfilePage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route element={<RoleGuard canAccess={canAccessUsersPage} />}>
              <Route path="usuarios" element={<UsersManagementPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
