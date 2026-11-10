import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand-400 text-black font-semibold hover:bg-brand-300 shadow-[0_0_24px_-6px_rgb(250_204_21/0.6)]',
  secondary:
    'border border-ink-600 bg-ink-800 text-zinc-100 hover:border-brand-400/70 hover:text-brand-300',
  ghost: 'text-zinc-300 hover:bg-ink-800 hover:text-brand-300',
  danger: 'bg-red-500 font-semibold text-white hover:bg-red-400',
}

const sizes = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  icon: 'p-2',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
