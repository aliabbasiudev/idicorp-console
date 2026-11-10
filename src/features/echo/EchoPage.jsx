import { useEffect, useRef, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { WS_BASE_URL } from '../../lib/config'
import { checkReadyMessage, useSocket } from '../../lib/useSocket'
import Button from '../../components/ui/Button'
import ConnectionPanel from '../../components/ui/ConnectionPanel'
import PageHeader from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'

const time = () => new Date().toLocaleTimeString('en-US', { hour12: false })

// The service only accepts /ws/echo when the handshake carries an Authorization header,
// which browsers cannot set on a WebSocket. Say so instead of a generic failure.
const AUTH_HINT =
  'The service may be rejecting the connection: /ws/echo requires an Authorization header, which browsers cannot send.'

export default function EchoPage() {
  const [message, setMessage] = useState('')
  const [log, setLog] = useState([])
  const nextId = useRef(0)
  const logEnd = useRef(null)

  const add = (kind, text) =>
    setLog((l) => [...l, { id: ++nextId.current, kind, text, at: time() }].slice(-200))

  const { status, error, connect, disconnect, send } = useSocket({
    url: `${WS_BASE_URL}/ws/echo`,
    checkHandshake: (raw) => checkReadyMessage(raw),
    onMessage: (raw) => add('received', String(raw)),
  })

  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: 'nearest' })
  }, [log])

  const submit = (event) => {
    event.preventDefault()
    if (!message.trim()) return
    if (send(message)) {
      add('sent', message)
      setMessage('')
    }
  }

  return (
    <>
      <PageHeader
        title="Text echo"
        description="Send text over a WebSocket and watch the service echo it back. The connection stays open for as many messages as you like."
      />
      <ConnectionPanel
        status={status}
        error={error ? `${error} ${AUTH_HINT}` : null}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <section className={`${cardClass} p-4 sm:p-5`} aria-labelledby="echo-log-title">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="echo-log-title" className="text-sm font-medium text-zinc-200">
            Messages
          </h2>
          <Button size="sm" variant="ghost" onClick={() => setLog([])} disabled={log.length === 0}>
            <Trash2 className="size-4" aria-hidden="true" />
            Clear
          </Button>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-label="Echo messages"
          tabIndex={0}
          className="h-72 overflow-y-auto rounded-xl border border-ink-700 bg-ink-950 p-3"
        >
          {log.length === 0 ? (
            <p className="text-sm text-zinc-500">No messages yet.</p>
          ) : (
            <ul className="space-y-2">
              {log.map((item) => (
                <li
                  key={item.id}
                  className={`flex flex-col ${item.kind === 'sent' ? 'items-end' : 'items-start'}`}
                >
                  <span
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                      item.kind === 'sent'
                        ? 'bg-brand-400 text-black'
                        : 'border border-ink-600 bg-ink-800 text-zinc-100'
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="mt-0.5 px-1 text-xs text-zinc-500">
                    {item.kind === 'sent' ? 'You' : 'Echo'} · {item.at}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div ref={logEnd} />
        </div>

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label htmlFor="echo-message" className="sr-only">
            Message
          </label>
          <input
            id="echo-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={status === 'ready' ? 'Type a message…' : 'Connect to send messages'}
            autoComplete="off"
            className={inputClass}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={status !== 'ready' || !message.trim()}
            className="shrink-0"
          >
            <Send className="size-4" aria-hidden="true" />
            Send
          </Button>
        </form>
      </section>
    </>
  )
}