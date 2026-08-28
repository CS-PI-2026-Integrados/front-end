import { useState } from 'react'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication/context/sessionContext'
import { DocumentArchive } from '../components/DocumentArchive'

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const [activeTab, setActiveTab] = useState('attendance')

  function openGroup(groupId) {
    window.open(`/grupos-reflexivos/${groupId}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Arquivo de Documentos"
        description="Repositório centralizado de comprovantes e documentos"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
          <TabsTrigger value="groups">Grupos Reflexivos</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <DocumentArchive tenantId={tenantId} source="attendance" />
        </TabsContent>

        <TabsContent value="groups">
          <DocumentArchive tenantId={tenantId} source="group" onOpenGroup={openGroup} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Documents
