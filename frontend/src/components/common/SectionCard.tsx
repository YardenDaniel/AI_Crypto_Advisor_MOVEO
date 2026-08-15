import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  children: ReactNode
  action?: ReactNode
}

export function SectionCard({ title, children, action }: SectionCardProps) {
  return (
    <section className="rounded-[var(--radius-md)] border border-border bg-card p-4 md:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-text">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
