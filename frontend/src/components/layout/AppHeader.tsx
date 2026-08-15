import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '../common/Button'
import { useAuth } from '../../hooks/useAuth'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-5 lg:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-ai">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            AI Crypto Advisor
          </p>
          <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">
            Daily briefing
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {user ? (
            <p className="max-w-20 truncate text-sm text-muted sm:max-w-none">
              {firstName(user.name)}
            </p>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out…' : 'Logout'}
          </Button>
        </div>
      </div>
    </header>
  )
}
