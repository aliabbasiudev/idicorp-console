import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { inputClass } from '../../components/ui/styles'
import { useCreateTask, useReplaceTask } from './hooks'
import { DESCRIPTION_MAX, TITLE_MAX, applyServerErrors, taskSchema } from './schema'

function TaskForm({ task, onDone }) {
  const isEdit = !!task
  const create = useCreateTask()
  const replace = useReplaceTask()
  const mutation = isEdit ? replace : create
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      completed: task?.completed ?? false,
    },
  })

  const titleLength = useWatch({ control, name: 'title' }).length
  const descriptionLength = useWatch({ control, name: 'description' }).length

  const onSubmit = (values) => {
    setFormError(null)
    const options = {
      onSuccess: () => {
        toast.success(isEdit ? 'Task updated' : 'Task created')
        onDone()
      },
      onError: (error) => {
        if (!applyServerErrors(error, setError)) setFormError(error.message)
      },
    }
    if (isEdit) {
      replace.mutate({ id: task.id, ...values }, options)
    } else {
      const { description, ...rest } = values
      create.mutate(description.trim() ? { ...rest, description } : rest, options)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {formError}
        </p>
      )}

      <Field
        label="Title"
        htmlFor="task-title"
        error={errors.title?.message}
        counter={`${titleLength}/${TITLE_MAX}`}
      >
        <input
          id="task-title"
          autoFocus
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          className={inputClass}
          {...register('title')}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="task-description"
        error={errors.description?.message}
        counter={`${descriptionLength}/${DESCRIPTION_MAX}`}
        hint="Optional."
      >
        <textarea
          id="task-description"
          rows={5}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'task-description-error' : undefined}
          className={inputClass}
          {...register('description')}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-200">
        <input type="checkbox" className="size-4 accent-brand-400" {...register('completed')} />
        Mark as completed
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onDone}>Cancel</Button>
        <Button type="submit" variant="primary" loading={mutation.isPending}>
          {isEdit ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  )
}

export default function TaskFormDialog({ open, task, onOpenChange }) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={task ? 'Edit task' : 'New task'}
      description={
        task
          ? 'Saving replaces the whole task. Tasks expire one hour after their last update.'
          : 'Tasks expire one hour after they are created or last updated.'
      }
    >
      <TaskForm task={task} onDone={() => onOpenChange(false)} />
    </Modal>
  )
}
