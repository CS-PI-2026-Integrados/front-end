import InstitutionInfo from '@/components/settings/InstitutionInfo'
import ReceiptFields from '@/components/settings/ReceiptFields'
import UserProfile from '@/components/settings/UserProfile'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSession } from '@/context/sessionContext'
import { isPrivilegedRole } from '@/lib/userPermissions'

export const Settings = () => {
  const { session } = useSession()
  const isAdmin = isPrivilegedRole(session?.user?.role)

  const defaultTab = isAdmin ? 'instituicao' : 'perfil'

  return (
    <div className="flex h-full w-full flex-col">
      <Tabs defaultValue={defaultTab} className="flex h-full w-full flex-1 flex-col">
        <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Configurações</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Configure as preferências do sistema
            </p>
          </div>

          <TabsList className="bg-muted text-muted-foreground grid h-auto w-full grid-cols-2 items-center justify-center rounded-lg p-1 shadow-sm md:inline-flex md:h-9 md:w-auto">
            {isAdmin && (
              <TabsTrigger
                value="instituicao"
                className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm md:px-3 md:text-sm md:whitespace-nowrap"
              >
                Dados da Instituição
              </TabsTrigger>
            )}
            <TabsTrigger
              value="perfil"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Meu Perfil
            </TabsTrigger>
          </TabsList>
        </div>

        {isAdmin && (
          <TabsContent value="instituicao" className="mt-0 w-full outline-none">
            <div className="space-y-6">
              <InstitutionInfo />
              <ReceiptFields />
            </div>
          </TabsContent>
        )}

        <TabsContent value="perfil" className="mt-0 w-full outline-none">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
