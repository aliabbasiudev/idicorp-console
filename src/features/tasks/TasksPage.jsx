import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardList, Plus, Search, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '../../lib/hooks'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ErrorMessage from '../../components/ui/ErrorMessage'
import PageHeader from '../../components/ui/PageHeader'
import { inputClass } from '../../components/ui/styles'
import DeleteTaskDialog from './DeleteTaskDialog'
import TaskCard from './TaskCard'
import TaskFormDialog from './TaskFormDialog'
import { usePatchTask, useTasks } from './hooks'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Open' },
  { value: 'completed', label: 'Done' },
]
const COMPLETED_PARAM = { all: undefined, active: 'false', completed: 'true' }

function ListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading tasks">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-ink-700 bg-ink-900/60"
        />
      ))}
    </div>
  )
}

export default function TasksPage() {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const rawStatus = params.get('status')
  const status = STATUS_OPTIONS.some((o) => o.value === rawStatus) ? rawStatus : 'all'

  const [search, setSearch] = useState(urlQuery)
  const debouncedSearch = useDebounce(search, 350)
  const [dialog, setDialog] = useState(null) // { task } — task null means "create"
  const [deleting, setDeleting] = useState(null)

  // Push the debounced search box value into the URL (shareable, survives navigation).
  useEffect(() => {
    const value = debouncedSearch.trim()
    setParams(
      (prev) => {
        if ((prev.get('q') ?? '') === value) return prev
        const next = new URLSearchParams(prev)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [debouncedSearch, setParams])

  const setStatus = (value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all') next.delete('status')
        else next.set('status', value)
        return next
      },
      { replace: true },
    )

  const tasksQuery = useTasks({ q: urlQuery, completed: COMPLETED_PARAM[status] })
  const patch = usePatchTask()

  const toggle = (task) =>
    patch.mutate(
      { id: task.id, completed: !task.completed },
      { onError: (error) => toast.error(error.message) },
    )

  const clearFilters = () => {
    setSearch('')
    setParams({}, { replace: true })
  }

  const tasks = tasksQuery.data ?? []
  const filtered = urlQuery !== '' || status !== 'all'

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Your tasks for this sign-in session. Tasks are removed one hour after they are created or last updated."
        actions={
          <Button variant="primary" onClick={() => setDialog({ task: null })}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="task-search" className="sr-only">
            Search tasks by title or description
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or description…"
            className={`${inputClass} pl-9`}
          />
        </div>

        <fieldset className="flex rounded-xl border border-ink-600 bg-ink-900 p-1">
          <legend className="sr-only">Filter by completion</legend>
          {STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium text-zinc-300 transition-colors has-[:checked]:bg-brand-400 has-[:checked]:text-black has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-400"
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={() => setStatus(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>

      <p role="status" className="mb-3 min-h-5 text-sm text-zinc-500">
        {tasksQuery.isSuccess &&
          (tasksQuery.isFetching
            ? 'Updating…'
            : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}${filtered ? ' match your filters' : ''}`)}
      </p>

      {tasksQuery.isPending ? (
        <ListSkeleton />
      ) : tasksQuery.isError ? (
        <ErrorMessage
          title="Couldn’t load tasks"
          message={tasksQuery.error.message}
          onRetry={() => tasksQuery.refetch()}
          retrying={tasksQuery.isFetching}
        />
      ) : tasks.length === 0 ? (
        filtered ? (
          <EmptyState
            icon={SearchX}
            title="No tasks match"
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          >
            Try a different search or filter.
          </EmptyState>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No tasks yet"
            action={
              <Button variant="primary" onClick={() => setDialog({ task: null })}>
                <Plus className="size-4" aria-hidden="true" />
                Create a task
              </Button>
            }
          >
            If you had tasks earlier, they may have expired — tasks are removed one hour after their
            last update, and each new sign-in starts a separate collection.
          </EmptyState>
        )
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard
                task={task}
                busy={patch.isPending && patch.variables?.id === task.id}
                onToggle={toggle}
                onEdit={(t) => setDialog({ task: t })}
                onDelete={setDeleting}
              />
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <TaskFormDialog
          open
          task={dialog.task}
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
        />
      )}
      {deleting && (
        <DeleteTaskDialog
          task={deleting}
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
        />
      )}
    </>
  )
}
