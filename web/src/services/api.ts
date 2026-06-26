const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

function getXsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function getOrigin(): string {
  if (API_BASE.startsWith('http')) {
    // Remove trailing /api to get the host origin for sanctum
    return API_BASE.replace(/\/api\/?$/, '')
  }
  return '' // relative path — same origin
}

async function ensureCsrfCookie(): Promise<void> {
  const sanctumPath = `${getOrigin()}/sanctum/csrf-cookie`
  await fetch(sanctumPath, {
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

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
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
