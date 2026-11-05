import { useState } from 'react'
import { Users, ClipboardList, CheckCircle, TriangleAlert } from 'lucide-react'
import { MetricCard } from '@/shared/components/data-display/MetricCard'
import { ProofData } from '../components/dashboard/ProofData'
import { RecentActivities } from '../components/dashboard/RecentActivities'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { usePersonDocuments, useDocumentActions, PdfPreviewModal } from '@/features/documents'
import { ApenadoDocumentsDialog } from '@/features/convicteds'

const Dashboard = () => {
  const { convicted, attendance } = useDashboardMetrics()
  const people = convicted.data
  const records = attendance.data
  const peoplePlaceholder = convicted.isLoading ? 'Carregando...' : 'Indisponível'
  const attendancePlaceholder = attendance.isLoading ? 'Carregando...' : 'Indisponível'

  const [pessoaSelecionada, setPessoaSelecionada] = useState(null)
  const {
    comprovantes,
    isLoading: documentosLoading,
    error: documentosError,
  } = usePersonDocuments(pessoaSelecionada)

  const {
    pdfDocument,
    openPdf,
    closePdf,
    downloadPdf,
    viewPdf,
    downloadDocumentPdf,
    isProcessing,
    pdfError,
  } = useDocumentActions()

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Visão geral" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de apenados"
          description={
            people
              ? `Ativos: ${people.active} · Inativos: ${people.inactive}`
              : 'Cadastrados na comarca'
          }
          data={people?.total ?? peoplePlaceholder}
          error={convicted.error}
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Atendimentos registrados"
          description="Nos últimos 7 dias"
          data={records?.last7Days ?? attendancePlaceholder}
          error={attendance.error}
          icon={<ClipboardList className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Com apresentação recente"
          description="Ativos com atendimento nos últimos 30 dias"
          data={people?.withRecentAttendance ?? peoplePlaceholder}
          error={convicted.error}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Sem apresentação recente"
          description="Ativos sem atendimento nos últimos 30 dias"
          data={people?.withoutRecentAttendance ?? peoplePlaceholder}
          error={convicted.error}
          icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <ProofData
            monthlyCounts={records?.monthlyCounts}
            isLoading={attendance.isLoading}
            error={attendance.error}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentActivities
            atividadesRecentes={records?.recentActivities}
            isLoading={attendance.isLoading}
            error={attendance.error}
            onSelect={setPessoaSelecionada}
          />
        </div>
      </div>

      <ApenadoDocumentsDialog
        person={pessoaSelecionada}
        comprovantes={comprovantes}
        isLoading={documentosLoading}
        error={documentosError}
        onView={openPdf}
        onDownload={downloadDocumentPdf}
        onOpenChange={(open) => {
          if (!open) setPessoaSelecionada(null)
        }}
      />
      <PdfPreviewModal
        document={pdfDocument}
        isProcessing={isProcessing}
        error={pdfError}
        onDownload={downloadPdf}
        onView={viewPdf}
        onClose={closePdf}
      />
    </div>
  )
}

export default Dashboard
