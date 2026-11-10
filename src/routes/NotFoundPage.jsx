import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      action={
        <Link
          to="/"
          className="inline-flex rounded-lg bg-brand-400 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-300"
        >
          Back to tasks
        </Link>
      }
    >
      The page you are looking for doesn’t exist.
    </EmptyState>
  )
}
