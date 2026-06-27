import InstitutionInfo from '@/components/settings/InstitutionInfo'
import ReceiptFields from '@/components/settings/ReceiptFields'

export const Settings = () => {
  return (
    <div className="max-w-7x1 mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Configure as preferências do sistema</p>
          <div className="grid gap-6">
            <InstitutionInfo />
            <ReceiptFields />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
