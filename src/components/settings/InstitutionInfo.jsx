import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { useInstitutionForm } from '@/hooks/useInstitutionForm'
import { LOGO_ACCEPTED_EXTENSIONS } from '@/services/tenantService'

const CharCounter = ({ current, max }) => {
  const isNearLimit = current > max * 0.85
  return (
    <span
      className={`text-xs tabular-nums ${
        isNearLimit ? 'text-destructive font-medium' : 'text-muted-foreground'
      }`}
    >
      {current}/{max}
    </span>
  )
}

const FormField = ({ id, label, value, onChange, error, maxLength, placeholder }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>{label}</Label>
      <CharCounter current={value.length} max={maxLength} />
    </div>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
    />
    {error && <p className="text-destructive text-sm font-medium">{error}</p>}
  </div>
)

export const InstitutionInfo = () => {
  const {
    nomeComarca,
    unidade,
    endereco,
    logoPreview,
    logoError,
    fieldErrors,
    isSaving,
    hasChanges,
    fileInputRef,
    maxFieldLength,
    handleFieldChange,
    handleFileSelect,
    handleRemoveLogo,
    handleSave,
  } = useInstitutionForm()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">Informações da Instituição</CardTitle>
        <CardDescription>
          Dados que aparecem nos documentos oficiais e na identidade visual da comarca
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Logo da Comarca</Label>

          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-colors ${
                logoError
                  ? 'border-destructive/50 bg-destructive/10'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview do logo da comarca"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-1">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-[11px]">Enviar logo</span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </button>

            <div className="flex flex-col gap-2 pt-1">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Formatos: <strong>PNG, JPG, WEBP</strong>
                <br />
                Tamanho máximo: <strong>1 MB</strong>
              </p>
              {logoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-fit"
                  onClick={handleRemoveLogo}
                >
                  <X className="mr-1 h-3 w-3" />
                  Remover logo
                </Button>
              )}
            </div>
          </div>

          {logoError && <p className="text-destructive text-sm font-medium">{logoError}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept={LOGO_ACCEPTED_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload de logo da comarca"
          />
        </div>

        <FormField
          id="nomeComarca"
          label="Nome da Comarca"
          value={nomeComarca}
          onChange={(v) => handleFieldChange('nomeComarca', v)}
          error={fieldErrors.nomeComarca}
          maxLength={maxFieldLength}
          placeholder="Ex: Comarca de Paranavaí"
        />

        <FormField
          id="unidade"
          label="Unidade"
          value={unidade}
          onChange={(v) => handleFieldChange('unidade', v)}
          error={fieldErrors.unidade}
          maxLength={maxFieldLength}
          placeholder="Ex: Vara de Execuções Penais"
        />

        <FormField
          id="endereco"
          label="Endereço Completo"
          value={endereco}
          onChange={(v) => handleFieldChange('endereco', v)}
          error={fieldErrors.endereco}
          maxLength={maxFieldLength}
          placeholder="Rua, número, bairro, cidade - UF"
        />

        <Button
          id="btn-save-institution"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-primary text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default InstitutionInfo
