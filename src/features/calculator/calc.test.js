import { describe, expect, it } from 'vitest'
import { describeCalculation, parseNumbers, validateRequest } from './calc'

describe('parseNumbers', () => {
  it('splits on spaces, commas, semicolons and new lines', () => {
    expect(parseNumbers('10, 20;30\n-4.5 1e3')).toEqual({ numbers: [10, 20, 30, -4.5, 1000] })
  })
  it('reports the first invalid token', () => {
    expect(parseNumbers('1 two 3').error).toMatch(/two/)
  })
  it('returns an empty list for blank input', () => {
    expect(parseNumbers('  ')).toEqual({ numbers: [] })
  })
})

describe('validateRequest', () => {
  it('requires at least one number', () => {
    expect(validateRequest('add', [])).toMatch(/at least one/)
  })
  it('allows at most 100 numbers', () => {
    expect(validateRequest('add', Array(100).fill(1))).toBeNull()
    expect(validateRequest('add', Array(101).fill(1))).toMatch(/at most 100/)
  })
  it('limits magnitude', () => {
    expect(validateRequest('add', [1e12])).toBeNull()
    expect(validateRequest('add', [1e12 + 1])).toMatch(/between/)
    expect(validateRequest('add', [-1e13])).toMatch(/between/)
  })
  it('rejects non-finite numbers', () => {
    expect(validateRequest('add', [Infinity])).toMatch(/finite/)
  })
  it('rejects division by zero but allows a zero dividend', () => {
    expect(validateRequest('divide', [10, 0])).toMatch(/zero/)
    expect(validateRequest('divide', [10, 2, 0])).toMatch(/zero/)
    expect(validateRequest('divide', [0, 5])).toBeNull()
    expect(validateRequest('multiply', [5, 0])).toBeNull()
  })
})

describe('describeCalculation', () => {
  it('joins numbers with the operator symbol', () => {
    expect(describeCalculation('multiply', [2, 3, 4])).toBe('2 × 3 × 4')
  })
  it('handles a single number', () => {
    expect(describeCalculation('add', [5])).toBe('add(5)')
  })
})
