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
        className={`flex shrink-0 items-center justify-between gap-3 ${
          compact ? 'mb-3' : 'mb-4 md:mb-5'
        }`}
      >
        <h2 className="text-lg font-semibold tracking-tight text-text">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
