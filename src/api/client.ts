import type { ErrorMessage, ValidationErrors } from '@/types/api'

const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? formatApiErrorMessage(body, status))
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function formatApiErrorMessage(body: unknown, status?: number): string {
  if (body && typeof body === 'object') {
    const err = body as ErrorMessage & ValidationErrors
    if (typeof err.error === 'string') return err.error
    if (typeof err.message === 'string') return err.message
    if (err.errors && typeof err.errors === 'object') {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
  }
  if (status === 401) return 'Authentication required.'
  if (status === 404) return 'Resource not found.'
  return 'Request failed.'
}

export function formatValidationErrors(body: unknown): Record<string, string[]> {
  if (body && typeof body === 'object' && 'errors' in body) {
    const { errors } = body as ValidationErrors
    if (errors && typeof errors === 'object') return errors
  }
  return {}
}

type ApiFetchOptions = RequestInit & {
  /** When false, do not attach Authorization header (default: attach if token exists). */
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth !== false) {
    const token = getStoredToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, body)
  }

  return body as T
}
