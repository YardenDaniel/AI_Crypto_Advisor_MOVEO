import type { ReactNode } from 'react'
import { Alert } from '../common/Alert'
import { Button } from '../common/Button'

export function SectionError({
  children,
  onRetry,
}: {
  children: ReactNode
  onRetry: () => void
}) {
  return (
    <div className="grid gap-3">
      <Alert tone="danger">{children}</Alert>
      <div>
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  )
}

export function SectionEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>
}
