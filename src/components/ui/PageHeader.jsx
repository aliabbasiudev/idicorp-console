export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {title}
          <span className="ml-1 text-brand-400">.</span>
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
