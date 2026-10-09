import { FieldLayout } from './FieldLayout'
import { Textarea } from '@/shared/components/ui/textarea'
export function TextareaField({ registration, placeholder, ...props }) {
  return (
    <FieldLayout {...props}>
      {(controls) => <Textarea {...registration} {...controls} placeholder={placeholder} />}
    </FieldLayout>
  )
}
