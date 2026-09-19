import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema } from '@/features/users/schemas/userSchemas'

export function useCreateOperatorForm({ onCreate, onOpenChange }) {
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched',
  })
  const submitOperator = async (data) => {
    try {
      await onCreate(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      form.setError(error.field || 'root', {
        type: 'server',
        message: error.message,
      })
    }
  }

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      form.reset()
    }

    onOpenChange(nextOpen)
  }

  return {
    form,
    handleOpenChange,
    submitOperator,
  }
}
