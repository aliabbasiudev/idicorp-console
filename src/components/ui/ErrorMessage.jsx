import { RefreshCw, TriangleAlert } from 'lucide-react'
import Button from './Button'

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retrying,
}) {
  return (
    <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-red-300">{title}</h2>
          <p className="mt-1 break-words text-sm text-red-200/90">{message}</p>
          {onRetry && (
            <Button size="sm" className="mt-3" onClick={onRetry} loading={retrying}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
