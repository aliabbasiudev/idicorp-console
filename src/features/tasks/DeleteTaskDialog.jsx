import { useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { toast } from 'sonner'
import Button from '../../components/ui/Button'
import { useDeleteTask } from './hooks'

export default function DeleteTaskDialog({ task, onOpenChange }) {
  const remove = useDeleteTask()
  const [error, setError] = useState(null)

  const confirm = () => {
    setError(null)
    remove.mutate(task.id, {
      onSuccess: () => {
        toast.success('Task deleted')
        onOpenChange(false)
      },
      onError: (err) => {
        if (err.status === 404) {
          toast.info('That task was already gone — it may have expired.')
          onOpenChange(false)
        } else {
          setError(err.message)
        }
      },
    })
  }

  return (
    <AlertDialog.Root open={!!task} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-600 bg-ink-900 p-6 shadow-2xl shadow-black">
          <AlertDialog.Title className="text-lg font-semibold text-zinc-50">
            Delete this task?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 break-words text-sm text-zinc-400">
            “{task?.title}” will be permanently deleted. This cannot be undone.
          </AlertDialog.Description>
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </AlertDialog.Cancel>
            <Button variant="danger" loading={remove.isPending} onClick={confirm}>
              Delete
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
