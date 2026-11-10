import { Plug, Unplug } from 'lucide-react'
import Button from './Button'

const STATES = {
  idle: { label: 'Not connected', dot: 'bg-zinc-500' },
  connecting: { label: 'Connecting…', dot: 'bg-brand-400 animate-pulse' },
  open: { label: 'Authenticating…', dot: 'bg-brand-400 animate-pulse' },
  ready: { label: 'Connected', dot: 'bg-emerald-400' },
  closed: { label: 'Disconnected', dot: 'bg-zinc-500' },
  error: { label: 'Connection failed', dot: 'bg-red-500' },
}

export default function ConnectionPanel({ status, error, onConnect, onDisconnect }) {
  const state = STATES[status] ?? STATES.idle
  const isLive = status === 'connecting' || status === 'open' || status === 'ready'

  return (
    <div className="mb-5 rounded-2xl border border-ink-700 bg-ink-900/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="flex items-center gap-2.5 text-sm font-medium text-zinc-100">
          <span className={`size-2.5 rounded-full ${state.dot}`} aria-hidden="true" />
          <span className="text-zinc-400">Connection:</span> {state.label}
        </p>
        {isLive ? (
          <Button size="sm" onClick={onDisconnect}>
            <Unplug className="size-4" aria-hidden="true" />
            Disconnect
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={onConnect}>
            <Plug className="size-4" aria-hidden="true" />
            {status === 'idle' ? 'Connect' : 'Reconnect'}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
