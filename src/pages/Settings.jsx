import InstitutionInfo from '@/components/settings/InstitutionInfo'
import PasswordChange from '@/components/settings/PasswordChange'
import ReceiptFields from '@/components/settings/ReceiptFields'
import { useSession } from '@/context/sessionContext'
import { isPrivilegedRole } from '@/lib/userPermissions'

export const Settings = () => {
  const { session } = useSession()
  const isAdmin = isPrivilegedRole(session?.user?.role)

  return (
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure as preferências do sistema</p>
        </div>

        <div className="grid gap-6">
          {isAdmin && (
            <>
              <InstitutionInfo />
              <ReceiptFields />
            </>
          )}
          <PasswordChange />
        </div>
      </div>
    </div>
  )
}

export default Settings
