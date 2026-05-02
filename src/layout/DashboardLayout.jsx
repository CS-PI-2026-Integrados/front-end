import { FileText, LayoutDashboard, Settings, Users, ClipboardPen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <>
      <div className="flex h-dvh flex-col overflow-hidden">
        <header className="bg-background flex h-14 shrink-0 items-center justify-between border-b">
          <div className="flex h-full w-60 border-e px-4">
            <span className="my-auto font-medium text-green-700">SICAPE</span>
          </div>
          <div className="flex items-center gap-3 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0">
                  <Avatar>
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="flex h-full w-60 flex-col gap-1 border-e p-4">
            <Button className="justify-start">
              <LayoutDashboard /> Dashboard
            </Button>
            <Button variant="ghost" className="justify-start">
              <Users /> Apenados
            </Button>
            <Button variant="ghost" className="justify-start">
              <FileText /> Comprovantes
            </Button>
            <Button variant="ghost" className="justify-start">
              <ClipboardPen /> Atendimento
            </Button>
            {/* <Button variant="ghost" className="justify-start">
              <FolderArchive /> Documentos
            </Button>
            <Button variant="ghost" className="justify-start">
              <ChartBar /> Relatorios
            </Button> */}
            <Button variant="ghost" className="justify-start">
              <Settings /> Configuracões
            </Button>
          </aside>
          <main className="bg-muted/60 w-full flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
