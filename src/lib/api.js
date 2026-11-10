import { useAuthStore } from '../stores/authStore'
import { API_BASE_URL } from './config'

export const SESSION_EXPIRED = 'Your session has expired. Please sign in again.'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function extractMessage(data, status, { auth = true } = {}) {
  if (status === 401 && auth) return SESSION_EXPIRED
  const detail = data?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const messages = detail.map((d) => d?.msg).filter(Boolean)
    if (messages.length) return messages.join('. ')
  }
  if (status === 401) return 'Sign-in failed. Check your username, password and CAPTCHA.'
  if (status === 404) return 'Not found. The item may have expired or been deleted.'
  if (status === 422) return 'The service rejected the input. Check the fields and try again.'
  if (status === 503) {
    return 'The service is temporarily unavailable (its data store may be down). Try again shortly.'
  }
  if (status === 502 || status === 504)
    return 'The service could not be reached. Try again shortly.'
  if (status >= 500) return `The service reported an error (${status}). Try again shortly.`
  return `Request failed (${status}).`
}

export function authHeaders(headers) {
  const h = new Headers(headers)
  const token = useAuthStore.getState().token
  if (token) h.set('Authorization', `Bearer ${token}`)
  return h
}

export async function apiFetch(path, { method = 'GET', body, headers, auth = true, signal } = {}) {
  const h = auth ? authHeaders(headers) : new Headers(headers)
  if (body !== undefined && !h.has('Content-Type')) h.set('Content-Type', 'application/json')

  let res
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: h,
      credentials: 'include',
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError('Network error. Check your connection and try again.', 0)
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = extractMessage(data, res.status, { auth })
    if (res.status === 401 && auth) useAuthStore.getState().logout(SESSION_EXPIRED)
    throw new ApiError(message, res.status, data)
  }
  return data
}
