import type { ReactNode } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'ai' | 'up' | 'down'

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
}

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-muted border-border',
  accent: 'bg-accent/15 text-accent border-accent/30',
  ai: 'bg-ai/15 text-ai border-ai/30',
  up: 'bg-up/15 text-up border-up/30',
  down: 'bg-down/15 text-down border-down/30',
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs ${toneClass[tone]}`}
    >
      {children}
    </span>
  )
}
