import { ChartBar, FileText, FolderArchive, LayoutDashboard, Settings, Users, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from '/assets/logo/to-light-background.svg';

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSession } from "@/context/SessionContext";


export default function DashboardLayout() {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false)
  const { session } = useSession()

  return (
    <>
      <div className="min-h-dvh flex">
        <div open={isMenuCollapsed} className="h-full open:w-full w-[0px] group z-10 absolute bg-black/5 md:bg-black/0"
        onClick={() => {setIsMenuCollapsed(false)}}>
          <div className=" bg-background transition-all group-open:shadow-lg group-open:md:shadow-none flex flex-col h-full w-60 border-e -translate-x-60 group-open:-translate-x-0 md:-translate-x-0 md:static">
            <div className=" flex px-4 h-14 border-b">
              <img src={Logo} alt="Logo marca" className="w-14" />
            </div>
            <aside className="p-4 flex flex-col gap-1">
              <Button asChild className="justify-start">
                <Link to="/dashboard" className="flex items-center gap-2 w-full">
                  <LayoutDashboard /> Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/apenados" className="flex items-center gap-2 w-full">
                  <Users /> Apenados
                </Link>
              </Button>
              <Button asChild variant="ghost" className="justify-start">
                <Link to="/comprovantes" className="flex items-center gap-2 w-full">
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
                <Link to="/configuracoes" className="flex items-center gap-2 w-full">
                  <Settings /> Configuracões
                </Link>
              </Button>
            </aside>
          </div>
        </div>
        <div className="flex flex-col h-full" style={{flex: 1}}>
          <header className="h-14 border-b flex items-center justify-between bg-background">
            <div className="flex items-center gap-3 px-4 w-full">
              <Button variant="ghost" className="md:hidden" onClick={() => {setIsMenuCollapsed(!isMenuCollapsed)}}>
                <Menu />
              </Button>
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-2 py-1 flex gap-2">
                      <User />
                      <div className="text-start flex flex-col">
                        <span className="text-black/75 font-medium text-sm">{session?.user.name}</span>
                        <span className="text-black/50 text-xs">{session?.tenant.name}</span>
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
          <main className="p-4" style={{flex: 1}}>
            <Outlet />
          </main>      
        </div>
      </div>
    </>
  )
}
