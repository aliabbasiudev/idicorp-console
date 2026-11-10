import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, SESSION_EXPIRED, apiFetch, extractMessage } from './api'
import { useAuthStore } from '../stores/authStore'

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new Error('no body')) : Promise.resolve(body)),
  }
}

describe('apiFetch', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'tok', notice: null })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the bearer token and includes credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, [{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    const data = await apiFetch('/api/tasks')

    expect(data).toEqual([{ id: 1 }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/tasks')
    expect(init.credentials).toBe('include')
    expect(init.headers.get('Authorization')).toBe('Bearer tok')
  })

  it('does not send the token for unauthenticated calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/auth/login', { auth: false })
    expect(fetchMock.mock.calls[0][1].headers.has('Authorization')).toBe(false)
  })

  it('serialises JSON bodies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(201, { id: 3 }))
    vi.stubGlobal('fetch', fetchMock)
    await apiFetch('/api/tasks', { method: 'POST', body: { title: 'x' } })
    const init = fetchMock.mock.calls[0][1]
    expect(init.body).toBe('{"title":"x"}')
    expect(init.headers.get('Content-Type')).toBe('application/json')
  })

  it('returns null for 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(204)))
    expect(await apiFetch('/api/tasks/1', { method: 'DELETE' })).toBeNull()
  })

  it('signs the user out on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(401, { detail: 'nope' })))
    await expect(apiFetch('/api/tasks')).rejects.toMatchObject({ status: 401 })
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().notice).toBe(SESSION_EXPIRED)
  })

  it('keeps the session on a failed login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(401, {})))
    await expect(
      apiFetch('/api/auth/login', { method: 'POST', body: {}, auth: false }),
    ).rejects.toThrow(/Sign-in failed/)
    expect(useAuthStore.getState().token).toBe('tok')
  })

  it('wraps network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await apiFetch('/api/tasks').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.message).toMatch(/Network error/)
  })
})

describe('extractMessage', () => {
  it('uses string detail', () => {
    expect(extractMessage({ detail: 'Bad thing' }, 400)).toBe('Bad thing')
  })
  it('joins validation messages', () => {
    const data = { detail: [{ msg: 'Too long' }, { msg: 'Required' }] }
    expect(extractMessage(data, 422)).toBe('Too long. Required')
  })
  it('explains 503', () => {
    expect(extractMessage(null, 503)).toMatch(/temporarily unavailable/)
  })
})
