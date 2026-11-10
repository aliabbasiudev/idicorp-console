import { describe, expect, it } from 'vitest'
import { checkReadyMessage } from './useSocket'

describe('checkReadyMessage', () => {
  it('accepts the ready message', () => {
    expect(checkReadyMessage('{"type":"ready"}')).toEqual({ ok: true })
  })
  it('maps known errors to friendly text', () => {
    const result = checkReadyMessage('{"error":"Unauthorized"}', { Unauthorized: 'Sign in again' })
    expect(result).toEqual({ ok: false, message: 'Sign in again' })
  })
  it('passes unknown errors through', () => {
    expect(checkReadyMessage('{"error":"Boom"}')).toEqual({ ok: false, message: 'Boom' })
  })
  it('rejects anything else', () => {
    expect(checkReadyMessage('hello').ok).toBe(false)
    expect(checkReadyMessage('{"type":"other"}').ok).toBe(false)
  })
})
