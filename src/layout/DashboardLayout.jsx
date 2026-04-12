import { ChartBar, FileText, FolderArchive, LayoutDashboard, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Outlet } from "react-router-dom";


export default function DashboardLayout() {
  return (
    <>
      <div className="h-dvh flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b flex items-center justify-between bg-background">
          <div className="w-60 h-full flex px-4 border-e">
            <span className="my-auto text-green-700 font-medium">SICAPE</span>
          </div>
          <div className="flex items-center gap-3 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto">
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
          <aside className="w-60 p-4 border-e h-full flex flex-col gap-1">
            <Button className="justify-start">
              <LayoutDashboard /> Dashboard
            </Button>
            <Button variant="ghost" className="justify-start">
              <Users /> Apenados
            </Button>
            <Button variant="ghost" className="justify-start">
              <FileText /> Comprovantes
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
          <main className="flex-1 w-full overflow-y-auto bg-muted/60">
            <Outlet />
          </main>
        </div>
      </div>
      
    </>
  );
}