import { ApiError, parseApiError } from './errors'
import { notifyUnauthorized } from './unauthorized'

type HttpMethod = 'GET' | 'POST' | 'PATCH'

type ApiRequestOptions = {
  method?: HttpMethod
  body?: unknown
  timeoutMs?: number
}

export function resolveApiBaseUrl(raw: string | undefined): string {
  const value = raw?.trim()

  if (!value) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Copy frontend/.env.example to frontend/.env',
    )
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`VITE_API_BASE_URL is invalid: "${value}"`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`VITE_API_BASE_URL must be http or https: "${value}"`)
  }

  return value.replace(/\/+$/, '')
}

function getApiBaseUrl(): string {
  return resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL)
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeoutId =
    options.timeoutMs === undefined
      ? undefined
      : window.setTimeout(() => controller.abort(), options.timeoutMs)

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      credentials: 'include',
      headers,
      signal: controller.signal,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Request timed out. Please try again.')
    }

    throw error
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await readJson(response)

  if (!response.ok) {
    const error = parseApiError(response.status, payload)

    if (error.status === 401 && !path.startsWith('/auth/')) {
      notifyUnauthorized()
    }

    throw error
  }

  return payload as T
}

export { ApiError }
