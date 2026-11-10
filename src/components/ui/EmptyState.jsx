export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-600 px-6 py-12 text-center">
      {Icon && (
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-brand-400/10 text-brand-400">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
