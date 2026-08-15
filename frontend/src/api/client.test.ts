import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, resolveApiBaseUrl } from './client'
import { parseApiError } from './errors'
import { login, logout } from './auth'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('resolveApiBaseUrl', () => {
  it('rejects a missing value', () => {
    expect(() => resolveApiBaseUrl(undefined)).toThrow(/VITE_API_BASE_URL is not set/)
  })

  it('rejects an invalid URL', () => {
    expect(() => resolveApiBaseUrl('not-a-url')).toThrow(/invalid/)
  })

  it('strips a trailing slash', () => {
    expect(resolveApiBaseUrl('http://localhost:8000/')).toBe(
      'http://localhost:8000',
    )
  })
})

describe('apiRequest', () => {
  it('sends credentials and uses the API base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ id: 1, name: 'Ada', email: 'ada@example.com' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/auth/me')

    expect(fetchMock).toHaveBeenCalledOnce()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]

    expect(url).toBe('http://localhost:8000/auth/me')
    expect(init.credentials).toBe('include')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
  })

  it('sends a JSON body and Content-Type on POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ id: 1, name: 'Ada', email: 'ada@example.com' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await login({ email: 'ada@example.com', password: 'secret' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]

    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(init.body).toBe(
      JSON.stringify({ email: 'ada@example.com', password: 'secret' }),
    )
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    })
  })

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ id: 7, name: 'Ada', email: 'ada@example.com' }),
      ),
    )

    const user = await apiRequest<{ id: number; name: string }>('/auth/me')

    expect(user).toEqual({ id: 7, name: 'Ada', email: 'ada@example.com' })
  })

  it('normalizes a string FastAPI detail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ detail: 'Invalid or expired token' }, 401),
      ),
    )

    const error = await apiRequest('/auth/me').catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 401,
      message: 'Invalid or expired token',
      detail: 'Invalid or expired token',
    })
  })

  it('normalizes a 422 validation list', async () => {
    const payload = {
      detail: [
        {
          loc: ['body', 'email'],
          msg: 'value is not a valid email address',
          type: 'value_error',
        },
      ],
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(payload, 422)),
    )

    const error = await apiRequest('/auth/signup', {
      method: 'POST',
      body: {},
    }).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 422,
      message: 'value is not a valid email address',
    })
  })

  it('treats 204 as success with no JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(logout()).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/auth/logout')
  })
})

describe('parseApiError', () => {
  it('keeps status codes used by later UI flows', () => {
    expect(parseApiError(404, { detail: 'Preferences not found' }).status).toBe(
      404,
    )
    expect(parseApiError(409, { detail: 'Email already registered' }).status).toBe(
      409,
    )
    expect(
      parseApiError(502, {
        detail: 'AI insight is temporarily unavailable. Please try again later.',
      }).message,
    ).toMatch(/temporarily unavailable/)
  })
})
