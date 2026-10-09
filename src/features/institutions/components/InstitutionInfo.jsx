import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import { ImageUploadField } from '@/shared/components/form-fields/ImageUploadField'
import { useInstitutionForm } from '@/features/institutions/hooks/useInstitutionForm'
import { LOGO_ACCEPTED_EXTENSIONS } from '@/features/institutions/model/logoConfig'

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
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
    />
    {error && (
      <p id={`${id}-error`} role="alert" className="text-destructive text-sm font-medium">
        {error}
      </p>
    )}
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
        <ImageUploadField
          id="institution-logo"
          label="Logo da Comarca"
          description="Formatos aceitos: PNG, JPG ou WEBP (máx. 1 MB)."
          preview={logoPreview}
          previewAlt="Preview do logo da comarca"
          previewClassName="object-contain p-1"
          error={logoError}
          disabled={isSaving}
          accept={LOGO_ACCEPTED_EXTENSIONS}
          fileInputRef={fileInputRef}
          onChange={handleFileSelect}
          selectLabel="Selecionar logo"
          changeLabel="Alterar logo"
          onRemove={logoPreview ? handleRemoveLogo : undefined}
          removeLabel="Remover logo"
        />

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
          disabled={isSaving}
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
