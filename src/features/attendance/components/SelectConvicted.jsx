import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { useConvictedDetail, useConvictedList } from '@/features/convicteds'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'
import { SearchPopover } from '@/shared/components/SearchPopover'
import { useAtendimento } from '../context/attendanceContext'
import { ConvictedInfoCard } from './ConvictedInfoCard'

export function SelectConvicted({ disabled = false, errors = {} }) {
  const { convicted, selectConvicted } = useAtendimento()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const hasSearch = Boolean(search.trim())
  const list = useConvictedList({
    search: search.trim(),
    page: 1,
    limit: 20,
    enabled: open && hasSearch && !disabled,
  })
  const detail = useConvictedDetail(selectedId)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (detail.convicted && detail.convicted.id === selectedId) selectConvicted(detail.convicted)
  }, [detail.convicted, selectedId, selectConvicted])
  return (
    <Card
      role="region"
      aria-label="Dados do apenado selecionado"
      aria-disabled={disabled || undefined}
      tabIndex={0}
      className={cn(
        'relative grid h-[min(40rem,calc(100dvh-12rem))] min-h-80 grid-rows-[auto_1fr_auto] gap-0 overflow-y-auto rounded-xl py-0 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-inset lg:h-full lg:min-h-0',
        disabled && 'opacity-50'
      )}
    >
      <div className="bg-card sticky top-0 z-10">
        <CardHeader className="shrink-0 items-start space-y-1 px-6 pt-5 pb-4">
          <CardTitle className="text-lg font-semibold md:text-xl">Dados do Atendimento</CardTitle>
          <p className="text-muted-foreground text-sm">Selecione o apenado e registre a foto</p>
        </CardHeader>
        <div className="space-y-1.5 px-6 pb-4">
          <Label htmlFor="attendance-convicted">
            Apenado <span className="text-destructive">*</span>
          </Label>
          <SearchPopover
            id="attendance-convicted"
            label="Apenado"
            aria-required
            aria-invalid={errors.convictedId ? true : undefined}
            aria-describedby={errors.convictedId ? 'attendance-convicted-error' : undefined}
            placeholder={
              convicted?.fullName ||
              (detail.isLoading ? 'Carregando cadastro...' : 'Selecione um apenado')
            }
            searchPlaceholder="Buscar por nome ou CPF"
            searchLabel="Buscar apenado por nome ou CPF"
            open={open}
            onOpenChange={setOpen}
            query={search}
            onQueryChange={setSearch}
            disabled={disabled}
            items={list.items}
            isLoading={list.isLoading}
            error={list.error}
            emptyMessage="Nenhum apenado encontrado."
            loadingMessage="Buscando apenados..."
            onSelect={(person) => {
              selectConvicted(null)
              if (selectedId === person.id) detail.refetch()
              else setSelectedId(person.id)
            }}
            renderItem={(person) => (
              <div className="flex min-w-0 gap-3">
                <p className="truncate">{person.fullName}</p>
                <p className="text-muted-foreground text-xs">{person.cpf}</p>
              </div>
            )}
          />
          {errors.convictedId && (
            <p id="attendance-convicted-error" role="alert" className="text-destructive text-xs">
              {errors.convictedId}
            </p>
          )}
        </div>
      </div>
      <CardContent className="relative px-6">
        {detail.isLoading ? (
          <p role="status">Carregando cadastro...</p>
        ) : detail.error ? (
          <p role="alert">{detail.error}</p>
        ) : convicted ? (
          <ConvictedInfoCard disabled={disabled} errors={errors} />
        ) : (
          <div className="absolute inset-x-6 inset-y-0 flex items-center justify-center">
            <div className="border-muted-foreground/25 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8">
              <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
                <FileText className="text-muted-foreground/50 h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-center text-sm font-medium">
                Selecione um apenado para gerar o comprovante
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <div className="bg-card sticky bottom-0 z-10 space-y-1.5 px-6 pt-8 pb-6">
        <Label>Data e Hora</Label>
        <div className="bg-muted rounded-md px-3 py-2.5">
          <p className="text-sm">{now.toLocaleString('pt-BR')}</p>
          <p className="text-muted-foreground mt-1 text-xs">Automático</p>
        </div>
      </div>
    </Card>
  )
}
