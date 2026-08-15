import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Alert } from '../components/common/Alert'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'
import { useAuth } from '../hooks/useAuth'
import { getAuthFormError } from '../utils/authErrors'
import { isValidEmail } from '../utils/validation'

type FieldErrors = {
  email?: string
  password?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!isValidEmail(email.trim())) {
      next.email = 'Enter a valid email address'
    }

    if (!password) {
      next.password = 'Password is required'
    }

    return next
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setFieldErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      await login({
        email: email.trim(),
        password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(getAuthFormError(error, 'login'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
      <p className="mt-2 text-sm text-muted">
        Welcome back. Use the email and password for your account.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
        {formError ? <Alert tone="danger">{formError}</Alert> : null}

        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={submitting}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={submitting}
          trailing={
            <button
              type="button"
              className="rounded-[var(--radius-sm)] p-2 text-muted hover:text-text"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
        />

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Need an account?{' '}
        <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
          Create one
        </Link>
      </p>
    </div>
  )
}
