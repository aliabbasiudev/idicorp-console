import { TASK_TTL_MINUTES } from './config'

// The service returns ISO timestamps with microseconds; normalise them for every browser.
export function parseServerDate(value) {
  if (!value) return null
  let iso = String(value).replace(/(\.\d{3})\d+/, '$1')
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(iso)) iso += 'Z'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDateTime(value) {
  const date = parseServerDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function minutesUntilExpiry(updatedAt, now = Date.now()) {
  const date = parseServerDate(updatedAt)
  if (!date) return null
  const expiresAt = date.getTime() + TASK_TTL_MINUTES * 60_000
  return Math.ceil((expiresAt - now) / 60_000)
}

export function expiryLabel(updatedAt, now = Date.now()) {
  const minutes = minutesUntilExpiry(updatedAt, now)
  if (minutes === null) return ''
  if (minutes <= 0) return 'Expired — refresh the list'
  if (minutes === 1) return 'Expires in 1 min'
  return `Expires in ${minutes} min`
}
