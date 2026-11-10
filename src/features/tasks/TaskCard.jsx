import { Clock, Pencil, Trash2 } from 'lucide-react'
import { useNow } from '../../lib/hooks'
import { expiryLabel, formatDateTime } from '../../lib/format'
import Button from '../../components/ui/Button'

export default function TaskCard({ task, busy, onToggle, onEdit, onDelete }) {
  const now = useNow()
  const expiry = expiryLabel(task.updated_at, now)

  return (
    <article
      className={`rounded-2xl border bg-ink-900/80 p-4 shadow-lg shadow-black/20 transition-colors sm:p-5 ${
        task.completed ? 'border-ink-700' : 'border-ink-600 hover:border-brand-400/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          disabled={busy}
          onChange={() => onToggle(task)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'not completed' : 'completed'}`}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-brand-400 disabled:cursor-wait"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2
              className={`break-words text-base font-semibold sm:text-lg ${
                task.completed ? 'text-zinc-500 line-through' : 'text-zinc-50'
              }`}
            >
              {task.title}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                task.completed
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-brand-400/15 text-brand-300'
              }`}
            >
              {task.completed ? 'Done' : 'Open'}
            </span>
          </div>
          {task.description && (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-zinc-400">
              {task.description}
            </p>
          )}
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
            <div className="flex gap-1">
              <dt>Created</dt>
              <dd>{formatDateTime(task.created_at)}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Updated</dt>
              <dd>{formatDateTime(task.updated_at)}</dd>
            </div>
            {expiry && (
              <div className="flex items-center gap-1 text-brand-400/80">
                <Clock className="size-3.5" aria-hidden="true" />
                <dd>{expiry}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:!text-red-400"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
