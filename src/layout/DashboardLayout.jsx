import {
  ChartBar,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Settings,
  Users,
  User,
  Menu,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '/assets/logo/to-light-background.svg'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession } from '@/context/SessionContext'

export default function DashboardLayout() {
  const [isMenuVisible, setisMenuVisible] = useState(false)
  const { session } = useSession()

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
              <Button asChild className="justify-start">
                <Link to="/dashboard" className="flex w-full items-center gap-2">
                  <LayoutDashboard /> Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/apenados" className="flex w-full items-center gap-2">
                  <Users /> Apenados
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/atendimento" className="flex w-full items-center gap-2">
                  <FileText /> Comprovantes
                </Link>
              </Button>
              {/* <Button asChild variant="ghost" className="justify-start">
                <Link to="/documentos" className="flex items-center gap-2 w-full">
                  <FolderArchive /> Documentos
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/relatorios" className="flex items-center gap-2 w-full">
                  <ChartBar /> Relatorios
                </Link>
              </Button> */}
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/configuracoes" className="flex w-full items-center gap-2">
                  <Settings /> Configuracões
                </Link>
              </Button>
            </aside>
          </div>
        </div>
        <div className="flex h-full flex-col" style={{ flex: 1 }}>
          <header className="bg-background flex h-14 items-center justify-between border-b">
            <div className="flex w-full items-center gap-3 px-4">
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
                    <Button variant="ghost" className="flex gap-2 px-2 py-1">
                      <User />
                      <div className="flex flex-col text-start">
                        <span className="text-sm font-medium text-black/75">
                          {session?.user.name}
                        </span>
                        <span className="text-xs text-black/50">{session?.tenant.name}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                    <DropdownMenuItem>Sair</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main
            className="h-dvh p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-track]:bg-neutral-700"
            style={{ flex: 1, overflow: 'auto' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
