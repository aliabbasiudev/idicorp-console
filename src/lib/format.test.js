import { describe, expect, it } from 'vitest'
import { expiryLabel, minutesUntilExpiry, parseServerDate } from './format'

describe('parseServerDate', () => {
  it('handles microsecond timestamps', () => {
    const d = parseServerDate('2026-11-09T20:22:47.603262Z')
    expect(d.toISOString()).toBe('2026-11-09T20:22:47.603Z')
  })
  it('treats timestamps without a zone as UTC', () => {
    expect(parseServerDate('2026-11-09T20:22:47').toISOString()).toBe('2026-11-09T20:22:47.000Z')
  })
  it('returns null for garbage', () => {
    expect(parseServerDate('nope')).toBeNull()
    expect(parseServerDate(undefined)).toBeNull()
  })
})

describe('expiry', () => {
  const updated = '2026-11-09T20:00:00Z'
  const at = (minutes) => Date.parse(updated) + minutes * 60_000

  it('counts down from one hour after the last update', () => {
    expect(minutesUntilExpiry(updated, at(0))).toBe(60)
    expect(minutesUntilExpiry(updated, at(45))).toBe(15)
  })
  it('labels the remaining time', () => {
    expect(expiryLabel(updated, at(30))).toBe('Expires in 30 min')
    expect(expiryLabel(updated, at(59.5))).toBe('Expires in 1 min')
    expect(expiryLabel(updated, at(61))).toMatch(/Expired/)
  })
})
