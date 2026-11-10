import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../lib/api'
import { applyServerErrors, taskSchema } from './schema'

describe('taskSchema', () => {
  const valid = { title: 'Write tests', description: '', completed: false }

  it('accepts a valid task', () => {
    expect(taskSchema.safeParse(valid).success).toBe(true)
  })
  it('requires a title', () => {
    expect(taskSchema.safeParse({ ...valid, title: '   ' }).success).toBe(false)
  })
  it('limits the title to 120 characters', () => {
    expect(taskSchema.safeParse({ ...valid, title: 'a'.repeat(120) }).success).toBe(true)
    expect(taskSchema.safeParse({ ...valid, title: 'a'.repeat(121) }).success).toBe(false)
  })
  it('limits the description to 2000 characters', () => {
    expect(taskSchema.safeParse({ ...valid, description: 'a'.repeat(2000) }).success).toBe(true)
    expect(taskSchema.safeParse({ ...valid, description: 'a'.repeat(2001) }).success).toBe(false)
  })
})

describe('applyServerErrors', () => {
  it('maps 422 detail items to fields', () => {
    const setError = vi.fn()
    const error = new ApiError('x', 422, {
      detail: [{ loc: ['body', 'title'], msg: 'String too long' }],
    })
    expect(applyServerErrors(error, setError)).toBe(true)
    expect(setError).toHaveBeenCalledWith('title', { type: 'server', message: 'String too long' })
  })
  it('ignores other errors', () => {
    const setError = vi.fn()
    expect(applyServerErrors(new ApiError('x', 500, null), setError)).toBe(false)
    expect(applyServerErrors(new Error('x'), setError)).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})
