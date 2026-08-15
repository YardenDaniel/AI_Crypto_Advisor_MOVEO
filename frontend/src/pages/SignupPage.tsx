import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Alert } from '../components/common/Alert'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'
import { useAuth } from '../hooks/useAuth'
import { getAuthFormError } from '../utils/authErrors'
import { isValidEmail, SIGNUP_PASSWORD_MIN_LENGTH } from '../utils/validation'

type FieldErrors = {
  name?: string
  email?: string
  password?: string
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!name.trim()) {
      next.name = 'Name is required'
    }

    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!isValidEmail(email.trim())) {
      next.email = 'Enter a valid email address'
    }

    if (!password) {
      next.password = 'Password is required'
    } else if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
      next.password = `Use at least ${SIGNUP_PASSWORD_MIN_LENGTH} characters`
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
      const result = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      if (result === 'needs_login') {
        navigate('/login', { replace: true })
        return
      }

      navigate('/', { replace: true })
    } catch (error) {
      setFormError(getAuthFormError(error, 'signup'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
      <p className="mt-2 text-sm text-muted">
        A name, email, and password are enough to get started.
      </p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
        {formError ? <Alert tone="danger">{formError}</Alert> : null}

        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          disabled={submitting}
        />

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
          autoComplete="new-password"
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
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </p>
    </div>
  )
}
