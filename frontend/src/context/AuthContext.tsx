import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from '../api/auth'
import { isApiError } from '../api/errors'
import {
  resetUnauthorizedHandling,
  setUnauthorizedHandler,
} from '../api/unauthorized'
import { Button } from '../components/common/Button'
import type { LoginRequest, SignupRequest, User } from '../types/auth'

type AuthStatus = 'booting' | 'ready' | 'error'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<User>
  signup: (data: SignupRequest) => Promise<'authenticated' | 'needs_login'>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

let restoreInFlight: Promise<User | null> | null = null

export function resetAuthSessionCache(): void {
  restoreInFlight = null
}

function restoreSession(): Promise<User | null> {
  if (!restoreInFlight) {
    restoreInFlight = getMe()
      .then((user) => user)
      .catch((error: unknown) => {
        if (isApiError(error) && error.status === 401) {
          return null
        }

        throw error
      })
      .finally(() => {
        restoreInFlight = null
      })
  }

  return restoreInFlight
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>('booting')

  const clearClientSession = useCallback(() => {
    setUser(null)
    resetAuthSessionCache()
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    let cancelled = false

    restoreSession()
      .then((nextUser) => {
        if (cancelled) {
          return
        }

        setUser(nextUser)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearClientSession()
      navigate('/login', { replace: true })
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [clearClientSession, navigate])

  const retryBoot = useCallback(() => {
    resetAuthSessionCache()
    setStatus('booting')

    restoreSession()
      .then((nextUser) => {
        setUser(nextUser)
        setStatus('ready')
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const nextUser = await loginRequest(data)
    setUser(nextUser)
    resetUnauthorizedHandling()
    return nextUser
  }, [])

  const signup = useCallback(async (data: SignupRequest) => {
    await signupRequest(data)

    try {
      const nextUser = await loginRequest({
        email: data.email,
        password: data.password,
      })
      setUser(nextUser)
      resetUnauthorizedHandling()
      return 'authenticated' as const
    } catch {
      return 'needs_login' as const
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearClientSession()
      resetUnauthorizedHandling()
    }
  }, [clearClientSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
    }),
    [login, logout, signup, user],
  )

  if (status === 'booting') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg px-4">
        <p className="text-sm text-muted" role="status">
          Restoring your session…
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
        <p className="max-w-sm text-sm text-muted">
          Unable to restore your session. Check your connection and try again.
        </p>
        <Button type="button" onClick={retryBoot}>
          Try again
        </Button>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
