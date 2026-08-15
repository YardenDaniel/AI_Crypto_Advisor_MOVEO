import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Button } from '../common/Button'
import { usePreferences } from '../../hooks/usePreferences'

export function OnboardingGate() {
  const location = useLocation()
  const { preferences, isLoading, isError, refetch } = usePreferences()
  const onOnboarding = location.pathname === '/onboarding'

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg px-4">
        <p className="text-sm text-muted" role="status">
          Loading your preferences…
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
        <p className="max-w-sm text-sm text-muted">
          Unable to load your preferences. Check your connection and try again.
        </p>
        <Button type="button" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!preferences && !onOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  if (preferences && onOnboarding) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
