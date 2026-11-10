import { apiFetch } from '../../lib/api'

export const getCaptcha = (signal) => apiFetch('/api/auth/login', { auth: false, signal })

export const login = (payload) =>
  apiFetch('/api/auth/login', { method: 'POST', body: payload, auth: false })
