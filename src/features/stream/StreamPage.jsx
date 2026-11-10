import { useEffect, useRef, useState } from 'react'
import { Send, Square } from 'lucide-react'
import Button from '../../components/ui/Button'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Field from '../../components/ui/Field'
import PageHeader from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'
import { streamEcho } from './api'

const INITIAL = { phase: 'idle', output: '', chunks: 0, bytes: 0, error: null }

export default function StreamPage() {
  const [text, setText] = useState('')
  const [state, setState] = useState(INITIAL)
  const controller = useRef(null)

  useEffect(() => () => controller.current?.abort(), [])

  const run = async (event) => {
    event.preventDefault()
    if (!text.trim() || state.phase === 'streaming') return

    const abort = new AbortController()
    controller.current = abort
    setState({ ...INITIAL, phase: 'streaming' })

    try {
      await streamEcho(text, {
        signal: abort.signal,
        onChunk: (chunk, bytes) =>
          setState((s) => ({
            ...s,
            output: s.output + chunk,
            chunks: s.chunks + 1,
            bytes: s.bytes + bytes,
          })),
      })
      setState((s) => ({ ...s, phase: 'done' }))
    } catch (error) {
      if (error.name === 'AbortError') setState((s) => ({ ...s, phase: 'cancelled' }))
      else setState((s) => ({ ...s, phase: 'error', error: error.message }))
    }
  }

  const streaming = state.phase === 'streaming'

  return (
    <>
      <PageHeader
        title="Stream echo"
        description="Send text to the streaming endpoint and watch the same content come back as it arrives."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={run} noValidate className={`${cardClass} space-y-4 p-5`}>
          <Field label="Text to send" htmlFor="stream-text">
            <textarea
              id="stream-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste some text…"
              className={inputClass}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={streaming}
              disabled={!text.trim()}
            >
              {!streaming && <Send className="size-4" aria-hidden="true" />}
              {streaming ? 'Streaming…' : 'Send'}
            </Button>
            {streaming && (
              <Button onClick={() => controller.current?.abort()}>
                <Square className="size-4" aria-hidden="true" />
                Cancel
              </Button>
            )}
          </div>
        </form>

        <section className={`${cardClass} p-5`} aria-labelledby="stream-out">
          <h2 id="stream-out" className="text-sm font-medium text-zinc-200">
            Response
          </h2>

          <p role="status" className="mt-2 min-h-5 text-xs text-zinc-500">
            {state.phase === 'idle' && 'Nothing sent yet.'}
            {state.phase === 'streaming' && 'Receiving…'}
            {state.phase === 'done' && 'Stream finished.'}
            {state.phase === 'cancelled' && 'Stream cancelled.'}
            {state.phase !== 'idle' &&
              ` ${state.chunks} ${state.chunks === 1 ? 'chunk' : 'chunks'} · ${state.bytes} bytes`}
          </p>

          {state.error && (
            <div className="mt-3">
              <ErrorMessage title="Stream failed" message={state.error} />
            </div>
          )}

          <pre
            tabIndex={0}
            aria-label="Streamed response"
            className="mt-3 h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-ink-700 bg-ink-950 p-3 font-mono text-sm text-brand-300"
          >
            {state.output}
          </pre>
        </section>
      </div>
    </>
  )
}
