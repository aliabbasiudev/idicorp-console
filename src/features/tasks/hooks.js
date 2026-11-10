import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, listTasks, patchTask, replaceTask } from './api'

export const taskKeys = {
  all: ['tasks'],
  list: (filters) => ['tasks', 'list', filters],
}

export function useTasks({ q, completed }) {
  return useQuery({
    queryKey: taskKeys.list({ q, completed }),
    queryFn: ({ signal }) => listTasks({ q, completed, signal }),
    placeholderData: keepPreviousData,
  })
}

// Every mutation refetches the lists afterwards, whether it succeeded or failed:
// after a 404 the list is stale because the task expired.
function useTaskMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export const useCreateTask = () => useTaskMutation(createTask)
export const useReplaceTask = () => useTaskMutation(({ id, ...body }) => replaceTask(id, body))
export const usePatchTask = () => useTaskMutation(({ id, ...body }) => patchTask(id, body))
export const useDeleteTask = () => useTaskMutation(deleteTask)
