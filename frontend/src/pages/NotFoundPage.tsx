import { Link } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
import { useAuth } from '../hooks/useAuth'

export function NotFoundPage() {
  const { user } = useAuth()
  const href = user ? '/' : '/login'

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted">That URL is not part of this app.</p>
      <p className="mt-6">
        <Link to={href} className="font-medium text-accent hover:text-accent-hover">
          {user ? 'Back to home' : 'Go to sign in'}
        </Link>
      </p>
    </PageContainer>
  )
}
