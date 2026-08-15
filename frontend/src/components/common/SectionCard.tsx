import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  children: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function SectionCard({
  title,
  children,
  action,
  compact = false,
  className = '',
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[var(--radius-md)] border border-border bg-card ${
        compact ? 'px-5 py-3.5 md:px-6 md:py-4' : 'p-5 md:p-6'
      } ${className}`.trim()}
    >
      <header
        className={`flex shrink-0 items-center justify-between gap-3 border-b border-border ${
          compact ? 'mb-3 pb-2.5' : 'mb-4 pb-3 md:mb-5'
        }`}
      >
        <h2 className="flex min-w-0 items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-text">
          <span
            className="h-4 w-1 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />
          <span className="truncate">{title}</span>
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
