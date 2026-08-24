import InstitutionInfo from '@/features/institutions/components/InstitutionInfo'
import ReceiptFields from '@/features/institutions/components/ReceiptFields'
import UserProfile from '@/features/users/components/UserProfile'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication/context/sessionContext'
import { isPrivilegedRole } from '@/features/users/utils/userPermissionsUtils'
import { PageHeader } from '@/shared/components/data-display/PageHeader'

export const Settings = () => {
  const { session } = useSession()
  const isAdmin = isPrivilegedRole(session?.user?.role)

  const defaultTab = isAdmin ? 'instituicao' : 'perfil'

  return (
    <Tabs defaultValue={defaultTab} className="space-y-5 p-0">
      <PageHeader
        title="Configurações"
        description="Configure as preferências do sistema"
        action={
          <TabsList
            className={`bg-muted text-muted-foreground grid h-auto w-full items-center justify-center rounded-lg p-1 shadow-sm md:inline-flex md:h-9 md:w-auto ${
              isAdmin ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {isAdmin && (
              <TabsTrigger
                value="instituicao"
                className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
              >
                Dados da Instituição
              </TabsTrigger>
            )}
            <TabsTrigger
              value="perfil"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Meu Perfil
            </TabsTrigger>
          </TabsList>
        }
      />

      {isAdmin && (
        <TabsContent value="instituicao" className="w-full outline-none">
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
  )
}

export default Settings
