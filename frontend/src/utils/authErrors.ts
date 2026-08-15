import { isApiError } from '../api/errors'

export function getAuthFormError(
  error: unknown,
  kind: 'login' | 'signup',
): string {
  if (isApiError(error)) {
    if (kind === 'login' && error.status === 401) {
      return 'Invalid email or password'
    }

    if (kind === 'signup' && error.status === 409) {
      return 'An account with this email already exists.'
    }

    return error.message
  }

  return 'Unable to reach the server. Please try again.'
}
