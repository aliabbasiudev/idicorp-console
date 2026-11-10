import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div role="alert" className="max-w-md rounded-2xl border border-red-500/40 bg-ink-900 p-6">
          <h1 className="text-lg font-semibold text-red-300">Something went wrong</h1>
          <p className="mt-2 text-sm text-zinc-400">
            The page hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-brand-400 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-300"
          >
            Reload
          </button>
        </div>
      </main>
    )
  }
}
