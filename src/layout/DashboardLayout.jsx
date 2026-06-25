import { FileText, LayoutDashboard, Users, User, Menu, UserCog, Boxes } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import Logo from '@/assets/logos/to-light-background.svg'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useSession } from '@/context/sessionContext'
import { canAccessUsersPage } from '@/lib/userPermissions'

export default function DashboardLayout() {
  const [isMenuVisible, setisMenuVisible] = useState(false)
  const { session, handleLogout } = useSession()
  const location = useLocation()
  const isActive = (path) => location.pathname === path
  const canManageUsers = canAccessUsersPage(session?.user)

  const onLogout = () => {
    handleLogout()
  }

  return (
    <>
      <div className="flex h-dvh">
        <div
          open={isMenuVisible}
          className="group absolute z-10 h-dvh w-[0px] bg-black/5 open:w-full md:static md:w-auto md:bg-black/0 open:md:w-auto"
          onClick={() => {
            setisMenuVisible(false)
          }}
        >
          <div className="bg-background flex h-full w-60 -translate-x-60 flex-col border-e transition-all group-open:-translate-x-0 group-open:shadow-lg md:static md:-translate-x-0 group-open:md:shadow-none">
            <div className="flex h-14 border-b px-4">
              <img src={Logo} alt="Logo marca" className="w-14" />
            </div>
            <aside className="flex flex-col gap-1 p-4">
              <Button
                asChild
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Link to="/dashboard" className="flex w-full items-center gap-2">
                  <LayoutDashboard /> Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/apenados') ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Link to="/apenados" className="flex w-full items-center gap-2">
                  <Users /> Apenados
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/atendimento') ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Link to="/atendimento" className="flex w-full items-center gap-2">
                  <FileText /> Comprovantes
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/grupos-reflexivos') ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Link to="/grupos-reflexivos" className="flex w-full items-center gap-2">
                  <Boxes /> Grupos Reflexivos
                </Link>
              </Button>
              {canManageUsers && (
                <Button
                  asChild
                  variant={isActive('/usuarios') ? 'default' : 'ghost'}
                  className="justify-start"
                >
                  <Link to="/usuarios" className="flex w-full items-center gap-2">
                    <UserCog /> Usuários
                  </Link>
                </Button>
              )}
              {/* <Button asChild variant={isActive('/documentos') ? 'default' : 'ghost'} className="justify-start">
                <Link to="/documentos" className="flex items-center gap-2 w-full">
                  <FolderArchive /> Documentos
                </Link>
              </Button>
              <Button asChildvariant={isActive('/relatorios') ? 'default' : 'ghost'} className="justify-start">
                <Link to="/relatorios" className="flex items-center gap-2 w-full">
                  <ChartBar /> Relatorios
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/configuracoes') ? 'default' : 'ghost'}
                className="justify-start"
              >
                <Link to="/configuracoes" className="flex w-full items-center gap-2">
                  <Settings /> Configuracões
                </Link>
              </Button> */}
            </aside>
          </div>
        </div>
        <div className="flex h-full min-w-0 flex-col" style={{ flex: 1 }}>
          <header className="bg-background flex h-14 items-center justify-between border-b">
            <div className="flex w-full min-w-0 items-center gap-3 px-3 sm:px-4">
              <Button
                variant="ghost"
                className="md:hidden"
                onClick={() => {
                  setisMenuVisible(!isMenuVisible)
                }}
              >
                <Menu />
              </Button>
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex max-w-[calc(100vw-5rem)] gap-2 px-2 py-1"
                    >
                      <User />
                      <div className="flex min-w-0 flex-col text-start">
                        <span className="truncate text-sm font-medium text-black/75">
                          {session?.user.name}
                        </span>
                        <span className="truncate text-xs text-black/50">
                          {session?.tenant.name}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem>Perfil</DropdownMenuItem> */}
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main
            className="h-dvh min-w-0 p-3 sm:p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-track]:bg-neutral-700"
            style={{ flex: 1, overflow: 'auto' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
