import { ApiError, SESSION_EXPIRED, authHeaders, extractMessage } from '../../lib/api'
import { API_BASE_URL } from '../../lib/config'
import { useAuthStore } from '../../stores/authStore'

/**
 * POSTs text to /api/echo/stream and reports the response body chunk by chunk.
 * The request body is sent in one piece; only the response is read as a stream.
 */
export async function streamEcho(text, { signal, onChunk }) {
  const headers = authHeaders({ 'Content-Type': 'text/plain; charset=utf-8' })

  let res
  try {
    res = await fetch(`${API_BASE_URL}/api/echo/stream`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: text,
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError('Network error. Check your connection and try again.', 0)
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message = extractMessage(data, res.status)
    if (res.status === 401) useAuthStore.getState().logout(SESSION_EXPIRED)
    throw new ApiError(message, res.status, data)
  }

  const decoder = new TextDecoder()

  if (!res.body) {
    const buffer = await res.arrayBuffer()
    onChunk(decoder.decode(buffer), buffer.byteLength)
    return
  }

  const reader = res.body.getReader()
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }), value.byteLength)
    }
    const rest = decoder.decode()
    if (rest) onChunk(rest, 0)
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError('The stream was interrupted. Try again.', 0)
  }
}
