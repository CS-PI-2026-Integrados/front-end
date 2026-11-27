import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSession } from '@/features/authentication'
import { useConvictedDetail } from '../hooks/useConvictedDetail'
import { useConvictedPhoto } from '../hooks/useConvictedPhoto'
import { ConvictedStatusDialog } from '../components/ConvictedStatusDialog'
import { ConvictedFormDialog } from '../components/ConvictedFormDialog'
import { ConvictedProfileDetails } from '../components/ConvictedProfileDetails'
import { BackToConvicteds, ConvictedProfileSummary } from '../components/ConvictedProfileSummary'
import { ConvictedSchedule } from '../components/ConvictedSchedule'
import './convictedProfile.css'

function ProfileContent({ id, Receipts }) {
  const { convicted, error, isLoading, refetch } = useConvictedDetail(id)
  const { url: photoUrl } = useConvictedPhoto(id)
  const [formOpen, setFormOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  if (isLoading) {
    return (
      <div
        role="status"
        className="text-muted-foreground flex min-h-64 items-center justify-center gap-2"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Carregando apenado…
      </div>
    )
  }

  if (error || !convicted) {
    return (
      <div className="space-y-4 p-4">
        <p role="alert" className="text-muted-foreground">
          {error || 'Apenado não encontrado.'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="convicted-profile grid gap-4">
        <div className="convicted-profile-summary min-w-0">
          <ConvictedProfileSummary convicted={convicted} photoUrl={photoUrl} />
        </div>
        <div className="convicted-profile-agenda min-w-0">
          <ConvictedSchedule convictedId={convicted.id} />
        </div>
        <div className="convicted-profile-details min-w-0">
          <ConvictedProfileDetails
            convicted={convicted}
            onEdit={() => setFormOpen(true)}
            onChangeStatus={() => setStatusOpen(true)}
          />
        </div>
      </div>
      <Receipts convicted={convicted} />
      <ConvictedFormDialog
        open={formOpen}
        convicted={convicted}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          setFormOpen(false)
          refetch()
        }}
      />
      {statusOpen && (
        <ConvictedStatusDialog
          convicted={convicted}
          open
          onOpenChange={setStatusOpen}
          onSuccess={() => {
            setStatusOpen(false)
            refetch()
          }}
        />
      )}
    </>
  )
}

export default function ConvictedProfile({ Receipts }) {
  const { id } = useParams()
  const { session } = useSession()
  const key = JSON.stringify([session?.user?.id, session?.tenant?.id, id])

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <BackToConvicteds />
      </div>
      <ProfileContent key={key} id={id} Receipts={Receipts} />
    </div>
  )
}
