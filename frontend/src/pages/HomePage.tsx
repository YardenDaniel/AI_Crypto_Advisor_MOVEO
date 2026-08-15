import { useState } from 'react'
import { Button } from '../components/common/Button'
import { PageContainer } from '../components/layout/PageContainer'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
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
    <PageContainer>
      <p className="mb-2 text-sm font-medium text-ai">AI Crypto Advisor</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {user?.name}
      </h1>
      <p className="mt-2 max-w-xl text-muted">Authentication is working.</p>
      <div className="mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Signing out…' : 'Logout'}
        </Button>
      </div>
    </PageContainer>
  )
}
