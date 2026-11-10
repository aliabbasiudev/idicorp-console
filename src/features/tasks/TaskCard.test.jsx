import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskCard from './TaskCard'

const task = {
  id: 7,
  title: 'Review onboarding flow',
  description: 'Check the steps.',
  completed: false,
  created_at: '2026-11-09T20:22:47.603262Z',
  updated_at: '2026-11-09T20:22:47.603262Z',
}

describe('TaskCard', () => {
  it('shows the task and wires up the actions', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<TaskCard task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />)

    expect(screen.getByRole('heading', { name: task.title })).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: /mark .* as completed/i }))
    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onToggle).toHaveBeenCalledWith(task)
    expect(onEdit).toHaveBeenCalledWith(task)
    expect(onDelete).toHaveBeenCalledWith(task)
  })

  it('marks completed tasks as done', () => {
    render(<TaskCard task={{ ...task, completed: true }} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
