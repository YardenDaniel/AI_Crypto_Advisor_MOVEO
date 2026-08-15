import type { ReactNode } from 'react'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

type AlertProps = {
  tone?: AlertTone
  children: ReactNode
}

const toneClass: Record<AlertTone, string> = {
  info: 'border-accent/40 bg-accent/10 text-text',
  success: 'border-up/40 bg-up/10 text-text',
  warning: 'border-warning/40 bg-warning/10 text-text',
  danger: 'border-danger/40 bg-danger/10 text-text',
}

export function Alert({ tone = 'info', children }: AlertProps) {
  const isAssertive = tone === 'danger' || tone === 'warning'

  return (
    <div
      role={isAssertive ? 'alert' : 'status'}
      className={`rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm ${toneClass[tone]}`}
    >
      {children}
    </div>
  )
}
