import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '../common/Button'
import { useAuth } from '../../hooks/useAuth'
import { useRefreshDashboard } from '../../hooks/dashboard/useRefreshDashboard'

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const { refresh, isRefreshing } = useRefreshDashboard()
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
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-5 lg:px-6">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ai">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            AI Crypto Advisor
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight">
            Daily briefing
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {user ? (
            <p className="hidden max-w-36 truncate text-sm text-muted sm:block">
              {firstName(user.name)}
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              void refresh()
            }}
            disabled={isRefreshing}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </span>
          </Button>
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
