import { z } from 'zod'
import { ApiError } from '../../lib/api'

export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 2000

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
  description: z
    .string()
    .max(DESCRIPTION_MAX, `Description must be ${DESCRIPTION_MAX} characters or fewer`),
  completed: z.boolean(),
})

const FIELDS = ['title', 'description', 'completed']

// Maps a 422 response ({detail:[{loc:[...,'title'],msg}]}) onto form fields.
// Returns true when at least one field error was set.
export function applyServerErrors(error, setError) {
  if (!(error instanceof ApiError) || error.status !== 422) return false
  const detail = error.data?.detail
  if (!Array.isArray(detail)) return false
  let handled = false
  for (const item of detail) {
    const field = item?.loc?.[item.loc.length - 1]
    if (FIELDS.includes(field)) {
      setError(field, { type: 'server', message: item.msg })
      handled = true
    }
  }
  return handled
}
