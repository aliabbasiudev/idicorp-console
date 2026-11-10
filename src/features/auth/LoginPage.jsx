import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { Info, RefreshCw, Zap } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { inputClass } from '../../components/ui/styles'
import { getCaptcha, login } from './api'

const schema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  captcha_answer: z.string().trim().min(1, 'Enter the text shown in the image'),
})

export default function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const notice = useAuthStore((s) => s.notice)
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const captcha = useQuery({
    queryKey: ['captcha'],
    queryFn: ({ signal }) => getCaptcha(signal),
    staleTime: Infinity,
    gcTime: 0,
  })

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (values) => login({ ...values, salt: captcha.data.salt }),
    onSuccess: (data) => {
      setToken(data.access_token)
      navigate('/', { replace: true })
    },
    onError: () => {
      resetField('captcha_answer')
      captcha.refetch()
    },
  })

  if (token) return <Navigate to="/" replace />

  const captchaLoading = captcha.isPending || captcha.isFetching
  const canSubmit = captcha.isSuccess && !captcha.isFetching && !mutation.isPending

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-400 text-black shadow-[0_0_30px_-4px_rgb(250_204_21/0.7)]">
            <Zap className="size-6" aria-hidden="true" />
          </span>
          <span className="text-2xl font-bold tracking-tight">
            IDICorp<span className="text-brand-400"> Console</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
          className="space-y-4 rounded-2xl border border-ink-700 bg-ink-900/85 p-6 shadow-2xl shadow-black/50 backdrop-blur"
        >
          <div>
            <h1 className="text-xl font-semibold text-zinc-50">Sign in</h1>
            <p className="mt-1 text-sm text-zinc-400">Use the credentials for your environment.</p>
          </div>

          {notice && !mutation.isError && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg border border-brand-400/40 bg-brand-400/10 p-3 text-sm text-brand-300"
            >
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {notice}
            </p>
          )}

          {mutation.isError && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {mutation.error.message}
            </p>
          )}

          <Field label="Username" htmlFor="username" error={errors.username?.message}>
            <input
              id="username"
              autoComplete="username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className={inputClass}
              {...register('username')}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={inputClass}
              {...register('password')}
            />
          </Field>

          <div>
            <div className="mb-2 flex min-h-16 items-center justify-between gap-3 rounded-lg border border-ink-600 bg-ink-950 p-2">
              {captchaLoading ? (
                <span role="status" className="px-2 text-sm text-zinc-400">
                  Loading CAPTCHA…
                </span>
              ) : captcha.isError ? (
                <span role="alert" className="px-2 text-sm text-red-400">
                  {captcha.error.message}
                </span>
              ) : (
                <img
                  src={captcha.data.captcha}
                  alt="CAPTCHA challenge. Type the characters you see."
                  className="h-12 rounded bg-white"
                />
              )}
              <Button size="sm" onClick={() => captcha.refetch()} disabled={captcha.isFetching}>
                <RefreshCw className="size-4" aria-hidden="true" />
                New image
              </Button>
            </div>
            <Field
              label="CAPTCHA text"
              htmlFor="captcha_answer"
              error={errors.captcha_answer?.message}
            >
              <input
                id="captcha_answer"
                autoComplete="off"
                aria-invalid={!!errors.captcha_answer}
                aria-describedby={errors.captcha_answer ? 'captcha_answer-error' : undefined}
                className={inputClass}
                {...register('captcha_answer')}
              />
            </Field>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!canSubmit}
            loading={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  )
}
