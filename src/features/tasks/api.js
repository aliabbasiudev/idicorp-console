import { apiFetch } from '../../lib/api'

export function listTasks({ q, completed, signal } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (completed === 'true' || completed === 'false') params.set('completed', completed)
  const qs = params.toString()
  return apiFetch(`/api/tasks${qs ? `?${qs}` : ''}`, { signal })
}

export const getTask = (id, options) => apiFetch(`/api/tasks/${id}`, options)
export const createTask = (body) => apiFetch('/api/tasks', { method: 'POST', body })
export const replaceTask = (id, body) => apiFetch(`/api/tasks/${id}`, { method: 'PUT', body })
export const patchTask = (id, body) => apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body })
export const deleteTask = (id) => apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
