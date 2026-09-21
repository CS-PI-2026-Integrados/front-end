import { ArrowLeft, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useConvictedDetail } from '@/features/convicteds/hooks/useConvictedDetail'
import { useConvictedPhoto } from '@/features/convicteds/hooks/useConvictedPhoto'
import { ConvictedDeactivateDialog } from '@/features/convicteds/components/ConvictedDeactivateDialog'
import { ConvictedFormDialog } from '@/features/convicteds/components/ConvictedFormDialog'
import { formatAddress, getConvictedStatusLabel } from '@/features/convicteds/utils/convictedUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'

export default function ConvictedProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { convicted, error, isLoading, refetch } = useConvictedDetail(id)
  const { url: photoUrl } = useConvictedPhoto(id)
  const [formOpen, setFormOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-64 items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        Carregando apenado...
      </div>
    )
  }

  if (error || !convicted) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-muted-foreground">{error || 'Apenado não encontrado.'}</p>
        <Button type="button" variant="outline" onClick={() => navigate('/apenados')}>
          <ArrowLeft /> Voltar para listagem
        </Button>
      </div>
    )
  }

  const initials = (convicted.name || 'A').charAt(0).toUpperCase()
  const handleFormSuccess = () => {
    setFormOpen(false)
    refetch()
  }

  const handleDeactivateSuccess = () => {
    setDeactivateOpen(false)
    navigate('/apenados')
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" onClick={() => navigate('/apenados')}>
        <ArrowLeft /> Voltar para listagem
      </Button>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setFormOpen(true)}>
          <Pencil /> Editar
        </Button>
        <Button type="button" variant="destructive" onClick={() => setDeactivateOpen(true)}>
          <Trash2 /> Inativar
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <section className="bg-card border-border rounded-xl border p-6 text-center">
          <Avatar className="mx-auto size-32">
            <AvatarImage src={photoUrl || undefined} alt={convicted.name} />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-foreground mt-4 text-xl font-semibold">{convicted.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">CPF: {convicted.cpf}</p>
          <span className="bg-secondary text-secondary-foreground mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            {getConvictedStatusLabel(convicted.status)}
          </span>
        </section>

        <section className="bg-card border-border rounded-xl border p-6">
          <h2 className="border-border mb-5 border-b pb-3 text-lg font-semibold">
            Dados do apenado
          </h2>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">
                Data de nascimento
              </dt>
              <dd className="mt-1 text-sm">{convicted.birthDate || 'Não informada'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Telefone</dt>
              <dd className="mt-1 text-sm">{convicted.phone || 'Não informado'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs font-semibold uppercase">Endereço</dt>
              <dd className="mt-1 text-sm">
                {formatAddress(convicted.address) || 'Não informado'}
              </dd>
            </div>
          </dl>

          <h2 className="border-border mt-8 mb-4 border-b pb-3 text-lg font-semibold">
            Processos vinculados
          </h2>
          {convicted.processes.length > 0 ? (
            <div className="space-y-2">
              {convicted.processes.map((process) => (
                <div
                  key={process.id}
                  className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded-lg p-3 text-sm"
                >
                  <span>{process.number}</span>
                  <span className="text-muted-foreground">
                    {process.principal ? 'Principal · ' : ''}
                    {getConvictedStatusLabel(process.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum processo vinculado.</p>
          )}
        </section>
      </div>

      <ConvictedFormDialog
        open={formOpen}
        convicted={convicted}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
      />
      <ConvictedDeactivateDialog
        convicted={convicted}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        onSuccess={handleDeactivateSuccess}
      />
    </div>
  )
}
