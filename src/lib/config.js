// Empty string = same-origin (/api is proxied by the Vite dev server / Netlify edge function).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// WebSockets cannot go through the HTTP proxy, so they connect to the service directly.
export const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || 'wss://ts.idicorp.ir').replace(
  /\/$/,
  '',
)

// Tasks are removed one hour after they are created or last updated.
export const TASK_TTL_MINUTES = 60
