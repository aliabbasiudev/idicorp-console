import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Calculator, ListTodo, LogOut, Menu, MessagesSquare, Waves, X, Zap } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Button from '../ui/Button'

const NAV_ITEMS = [
  { to: '/', label: 'Tasks', icon: ListTodo, end: true },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/echo', label: 'Text echo', icon: MessagesSquare },
  { to: '/stream', label: 'Stream echo', icon: Waves },
]

function NavItems({ onNavigate }) {
  return NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-400/15 text-brand-300'
            : 'text-zinc-300 hover:bg-ink-800 hover:text-brand-300'
        }`
      }
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </NavLink>
  ))
}

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-400 text-black">
              <Zap className="size-5" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight">
              IDICorp<span className="text-brand-400"> Console</span>
            </span>
          </div>

          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            <NavItems />
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Main"
            className="flex flex-col gap-1 border-t border-ink-700 px-4 py-3 md:hidden"
          >
            <NavItems onNavigate={() => setMenuOpen(false)} />
          </nav>
        )}
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 focus:outline-none"
      >
        <Outlet />
      </main>

      <footer className="border-t border-ink-700 py-4 text-center text-xs text-zinc-500">
        IDICorp Service Console
      </footer>
    </div>
  )
}
