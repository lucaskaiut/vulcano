const API_BASE = '/api'

function getXsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrfCookie(): Promise<void> {
  await fetch('/sanctum/csrf-cookie', {
    credentials: 'include',
  })
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET'

  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrfCookie()
  }

  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const xsrfToken = getXsrfToken()
  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', xsrfToken)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? 'Erro na requisição.',
      response.status,
      data?.errors,
    )
  }

  return data as T
}

export { API_BASE }
