import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/LoginPage'
import TasksPage from './features/tasks/TasksPage'
import NotFoundPage from './routes/NotFoundPage'
import ProtectedRoute from './routes/ProtectedRoute'

// Rarely used pages are loaded on demand to keep the first load small.
const CalculatorPage = lazy(() => import('./features/calculator/CalculatorPage'))
const EchoPage = lazy(() => import('./features/echo/EchoPage'))
const StreamPage = lazy(() => import('./features/stream/StreamPage'))

function PageFallback() {
  return (
    <p role="status" className="py-12 text-center text-sm text-zinc-500">
      Loading…
    </p>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<TasksPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="echo" element={<EchoPage />} />
          <Route path="stream" element={<StreamPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
