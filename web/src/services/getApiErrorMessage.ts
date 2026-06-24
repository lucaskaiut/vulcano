import { ApiError } from './api'

const FALLBACK_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.'

function isTechnicalMessage(message: string): boolean {
  return /^[\w.-]+$/.test(message) && message.includes('.')
}

export function getApiErrorMessage(error: ApiError, field?: string): string {
  if (field && error.errors?.[field]?.[0]) {
    return error.errors[field][0]
  }

  const firstFieldError = error.errors
    ? Object.values(error.errors).flat()[0]
    : undefined

  if (firstFieldError) {
    return firstFieldError
  }

  if (error.message && !isTechnicalMessage(error.message)) {
    return error.message
  }

  return FALLBACK_MESSAGE
}
