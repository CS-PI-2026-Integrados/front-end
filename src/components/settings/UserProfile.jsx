import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Video, RefreshCw, Loader2, AlertCircle, Clock, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useSession } from '@/context/sessionContext'
import { useTenant } from '@/context/TenantContext'
import { maskCpf, getRoleLabel } from '@/lib/userFormatters'
import { useUserProfile } from '@/hooks/useUserProfile'
import PasswordChange from '@/components/settings/PasswordChange'

const ReadField = ({ label, value }) => (
  <div className="space-y-1">
    <Label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
      {label}
    </Label>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
)

export function UserProfile() {
  const { session } = useSession()
  const { sessionTimeout } = useTenant()
  const user = session?.user

  const sessionTimeoutHours = sessionTimeout || 8
  const { cameras, selectedCamera, cameraLoading, cameraError, loadCameras, handleCameraChange } =
    useUserProfile()

  useEffect(() => {
    loadCameras()
  }, [loadCameras])

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold">Informações do Usuário</CardTitle>
          <CardDescription>Dados do seu perfil de acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <ReadField label="Nome Completo" value={user?.name} />
            <ReadField label="CPF" value={maskCpf(user?.cpf)} />
            <ReadField label="E-mail" value={user?.email} />
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Nível de Acesso
              </Label>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="pt-5">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Clock className="text-muted-foreground h-4 w-4" />
            </div>
            <p className="text-muted-foreground text-sm">
              Sua sessão expira em{' '}
              <span className="text-foreground font-semibold">{sessionTimeoutHours} horas</span>{' '}
              conforme configuração do administrador.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-bold">Câmera Preferida</CardTitle>
          <CardDescription>
            Dispositivo de vídeo padrão para captura de foto no atendimento
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Select
              value={selectedCamera || undefined}
              onValueChange={handleCameraChange}
              disabled={cameraLoading || cameras.length === 0}
            >
              <SelectTrigger className="flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <Video className="text-muted-foreground h-4 w-4 shrink-0" />
                  <SelectValue
                    placeholder={
                      cameraLoading
                        ? 'Detectando câmeras...'
                        : cameras.length === 0
                          ? 'Nenhuma câmera disponível'
                          : 'Selecione uma câmera'
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent>
                {cameras
                  .filter((device) => device.deviceId)
                  .map((device, i) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Câmera ${i + 1}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={loadCameras}
              disabled={cameraLoading}
              title="Detectar câmeras novamente"
            >
              {cameraLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {cameraError && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-sm text-yellow-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
          )}

          {selectedCamera && !cameraError && (
            <p className="text-muted-foreground text-xs">
              Preferência salva. Será usada automaticamente na próxima sessão de atendimento.
            </p>
          )}
        </CardContent>
      </Card>

      <PasswordChange />
    </div>
  )
}

export default UserProfile
