import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import { FieldLayout } from './FieldLayout'

export function ImageUploadField({
  id,
  label,
  labelClassName,
  variant,
  required,
  disabled,
  error,
  description,
  preview,
  previewAlt,
  previewClassName,
  accept,
  fileInputRef,
  onChange,
  selectLabel = 'Selecionar imagem',
  changeLabel = 'Alterar imagem',
  onRemove,
  removeLabel = 'Remover imagem',
  processingMessage,
}) {
  const internalRef = useRef(null)
  const inputRef = fileInputRef || internalRef

  return (
    <FieldLayout {...{ id, label, labelClassName, variant, required, disabled, error }}>
      {(controls) => {
        const descriptionId = `${controls.id}-description`
        const describedBy =
          [description && descriptionId, controls['aria-describedby']].filter(Boolean).join(' ') ||
          undefined

        return (
          <div className="flex items-start gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-label={`${preview ? changeLabel : selectLabel}: ${label}`}
              aria-describedby={describedBy}
              aria-invalid={controls['aria-invalid']}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'bg-muted/40 hover:bg-muted size-24 shrink-0 flex-col gap-0 overflow-hidden rounded-lg border-2 border-dashed p-0',
                error ? 'border-destructive' : 'border-muted-foreground/30'
              )}
            >
              {preview ? (
                <img
                  src={preview}
                  alt={previewAlt || label}
                  className={cn('size-full object-cover', previewClassName)}
                />
              ) : (
                <>
                  <Upload className="text-muted-foreground size-5" />
                  <span className="text-muted-foreground mt-1 text-[10px] font-medium">Upload</span>
                </>
              )}
            </Button>
            <div className="min-w-0 flex-1 space-y-2">
              {description && (
                <p id={descriptionId} className="text-muted-foreground text-xs">
                  {description}
                </p>
              )}
              <Input
                {...controls}
                aria-describedby={describedBy}
                ref={inputRef}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={onChange}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  {preview ? changeLabel : selectLabel}
                </Button>
                {onRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="xs"
                    disabled={disabled}
                    onClick={onRemove}
                  >
                    {removeLabel}
                  </Button>
                )}
              </div>
              {processingMessage && (
                <p role="status" className="text-muted-foreground text-xs">
                  {processingMessage}
                </p>
              )}
            </div>
          </div>
        )
      }}
    </FieldLayout>
  )
}
