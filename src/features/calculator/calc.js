export const OPERATIONS = [
  { value: 'add', label: 'Add', symbol: '+' },
  { value: 'subtract', label: 'Subtract', symbol: '−' },
  { value: 'multiply', label: 'Multiply', symbol: '×' },
  { value: 'divide', label: 'Divide', symbol: '÷' },
]

export const MAX_NUMBERS = 100
export const MAX_ABS = 1_000_000_000_000

const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

// "10, 20 30" -> { numbers: [10, 20, 30] } | { error }
export function parseNumbers(input) {
  const tokens = input.split(/[\s,;]+/).filter(Boolean)
  const numbers = []
  for (const token of tokens) {
    if (!NUMBER_PATTERN.test(token)) return { error: `“${token}” is not a valid number.` }
    numbers.push(Number(token))
  }
  return { numbers }
}

// Mirrors the service rules; returns an error message or null.
export function validateRequest(operation, numbers) {
  if (numbers.length < 1) return 'Enter at least one number.'
  if (numbers.length > MAX_NUMBERS) return `Enter at most ${MAX_NUMBERS} numbers.`
  if (numbers.some((n) => !Number.isFinite(n))) return 'All numbers must be finite.'
  if (numbers.some((n) => Math.abs(n) > MAX_ABS)) {
    return 'Each number must be between −1,000,000,000,000 and 1,000,000,000,000.'
  }
  if (operation === 'divide' && numbers.slice(1).some((n) => n === 0)) {
    return 'Division by zero is not allowed.'
  }
  return null
}

export function describeCalculation(operation, numbers) {
  const symbol = OPERATIONS.find((o) => o.value === operation)?.symbol ?? '+'
  return numbers.length === 1 ? `${operation}(${numbers[0]})` : numbers.join(` ${symbol} `)
}
