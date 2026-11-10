import { useEffect, useRef, useState } from 'react'
import { Equal } from 'lucide-react'
import { WS_BASE_URL } from '../../lib/config'
import { checkReadyMessage, useSocket } from '../../lib/useSocket'
import { useAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'
import ConnectionPanel from '../../components/ui/ConnectionPanel'
import Field from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'
import { MAX_NUMBERS, OPERATIONS, describeCalculation, parseNumbers, validateRequest } from './calc'

const HISTORY_LIMIT = 20

export default function CalculatorPage() {
  const [operation, setOperation] = useState('add')
  const [input, setInput] = useState('')
  const [validation, setValidation] = useState(null)
  const [history, setHistory] = useState([])
  const pending = useRef([])
  const nextId = useRef(0)

  const { status, error, connect, disconnect, send } = useSocket({
    url: `${WS_BASE_URL}/ws/calculator`,
    // The service expects the access token as the first message, within one second.
    onOpen: (ws) => ws.send(JSON.stringify({ token: useAuthStore.getState().token })),
    checkHandshake: (raw) =>
      checkReadyMessage(raw, {
        Unauthorized: 'The service rejected your access token. Sign out and sign in again.',
      }),
    onMessage: (raw) => {
      const entry = pending.current.shift()
      if (!entry) return
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        data = { error: 'Unreadable response from the service.' }
      }
      const outcome =
        data && 'result' in data
          ? { result: data.result }
          : { error: data?.error ?? 'Unexpected response from the service.' }
      setHistory((h) => [{ ...entry, ...outcome }, ...h].slice(0, HISTORY_LIMIT))
    },
  })

  // Requests still waiting when the connection drops will never be answered.
  useEffect(() => {
    if (status === 'ready' || pending.current.length === 0) return
    const dropped = pending.current.map((entry) => ({
      ...entry,
      error: 'No response — the connection was closed.',
    }))
    pending.current = []
    setHistory((h) => [...dropped.reverse(), ...h].slice(0, HISTORY_LIMIT))
  }, [status])

  const submit = (event) => {
    event.preventDefault()
    const parsed = parseNumbers(input)
    if (parsed.error) return setValidation(parsed.error)
    const problem = validateRequest(operation, parsed.numbers)
    if (problem) return setValidation(problem)

    const entry = { id: ++nextId.current, operation, numbers: parsed.numbers }
    if (!send(JSON.stringify({ operation, numbers: parsed.numbers }))) {
      return setValidation('Not connected. Reconnect and try again.')
    }
    setValidation(null)
    pending.current.push(entry)
  }

  const latest = history[0]

  return (
    <>
      <PageHeader
        title="Calculator"
        description="Add, subtract, multiply or divide up to 100 numbers over a live WebSocket connection."
      />
      <ConnectionPanel
        status={status}
        error={error}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={submit} noValidate className={`${cardClass} space-y-5 p-5`}>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-zinc-200">Operation</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OPERATIONS.map((op) => (
                <label
                  key={op.value}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-brand-400/60 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-400 has-[:checked]:text-black has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-400"
                >
                  <input
                    type="radio"
                    name="operation"
                    value={op.value}
                    checked={operation === op.value}
                    onChange={() => setOperation(op.value)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{op.symbol}</span>
                  {op.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            label="Numbers"
            htmlFor="calc-numbers"
            error={validation}
            hint={`Separate with spaces, commas or new lines (1–${MAX_NUMBERS} numbers).`}
          >
            <textarea
              id="calc-numbers"
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="10, 20, 5"
              aria-invalid={!!validation}
              aria-describedby={validation ? 'calc-numbers-error' : undefined}
              className={`${inputClass} font-mono`}
            />
          </Field>

          <Button type="submit" variant="primary" className="w-full" disabled={status !== 'ready'}>
            <Equal className="size-4" aria-hidden="true" />
            Calculate
          </Button>
          {status !== 'ready' && (
            <p className="text-center text-xs text-zinc-500">Waiting for a connection…</p>
          )}
        </form>

        <section className={`${cardClass} p-5`} aria-labelledby="calc-results">
          <h2 id="calc-results" className="text-sm font-medium text-zinc-200">
            Result
          </h2>
          <div role="status" aria-live="polite" className="mt-3 min-h-20">
            {!latest && <p className="text-sm text-zinc-500">No calculations yet.</p>}
            {latest && 'result' in latest && (
              <p className="break-all font-mono text-3xl font-bold text-brand-400 sm:text-4xl">
                {String(latest.result)}
              </p>
            )}
            {latest?.error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {latest.error}
              </p>
            )}
          </div>

          {history.length > 0 && (
            <>
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                History
              </h3>
              <ul className="max-h-64 space-y-1.5 overflow-y-auto text-sm">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap justify-between gap-x-4 rounded-lg bg-ink-950 px-3 py-2 font-mono"
                  >
                    <span className="break-all text-zinc-400">
                      {describeCalculation(item.operation, item.numbers)}
                    </span>
                    {'result' in item ? (
                      <span className="break-all text-brand-300">= {String(item.result)}</span>
                    ) : (
                      <span className="text-red-400">{item.error}</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
  )
}
