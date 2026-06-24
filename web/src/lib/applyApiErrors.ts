import type { UseFormSetError, FieldValues, Path } from 'react-hook-form'
import { ApiError } from '../services/api'

export function applyApiErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  fallbackMessage = 'Não foi possível salvar.',
): string | null {
  if (error.errors) {
    for (const [field, messages] of Object.entries(error.errors)) {
      if (messages[0]) {
        setError(field as Path<T>, { message: messages[0] })
      }
    }

    return null
  }

  return error.message || fallbackMessage
}
