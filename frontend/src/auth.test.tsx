import { StrictMode } from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe, login, logout, signup } from './api/auth'
import { getPreferences } from './api/preferences'
import {
  getAiInsight,
  getCoinPrices,
  getMarketNews,
  getMeme,
} from './api/dashboard'
import { ApiError } from './api/errors'
import { resetAuthSessionCache } from './context/AuthContext'
import { findDashboard, renderApp } from './test/renderApp'
import {
  insightResponse,
  memeResponse,
  newsResponse,
  pricesResponse,
} from './test/dashboardFixtures'
import type { Preference } from './types/preferences'

vi.mock('./api/auth', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('./api/preferences', () => ({
  getPreferences: vi.fn(),
  createPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}))

vi.mock('./api/dashboard', () => ({
  getCoinPrices: vi.fn(),
  getMarketNews: vi.fn(),
  getMeme: vi.fn(),
  getAiInsight: vi.fn(),
  submitVote: vi.fn(),
}))

const guestError = new ApiError(401, 'Not authenticated', 'Not authenticated')

const user = {
  id: 1,
  name: 'Ada',
  email: 'ada@example.com',
}

const savedPreferences: Preference = {
  user_id: 1,
  assets: ['BTC', 'ETH'],
  investor_type: 'hodler',
  content_types: ['market_news', 'charts'],
}

afterEach(() => {
  resetAuthSessionCache()
})

beforeEach(() => {
  vi.mocked(getMe).mockReset()
  vi.mocked(login).mockReset()
  vi.mocked(signup).mockReset()
  vi.mocked(logout).mockReset()
  vi.mocked(getPreferences).mockReset()
  vi.mocked(getCoinPrices).mockReset()
  vi.mocked(getMarketNews).mockReset()
  vi.mocked(getMeme).mockReset()
  vi.mocked(getAiInsight).mockReset()
  vi.mocked(getMe).mockRejectedValue(guestError)
  vi.mocked(logout).mockResolvedValue(undefined)
  vi.mocked(getPreferences).mockResolvedValue(savedPreferences)
  vi.mocked(getCoinPrices).mockResolvedValue(pricesResponse)
  vi.mocked(getMarketNews).mockResolvedValue(newsResponse)
  vi.mocked(getMeme).mockResolvedValue(memeResponse)
  vi.mocked(getAiInsight).mockResolvedValue(insightResponse)
})

describe('session restore', () => {
  it('shows the authenticated home when /auth/me succeeds', async () => {
    vi.mocked(getMe).mockResolvedValue(user)

    renderApp('/')

    expect(await findDashboard()).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prices' })).toBeInTheDocument()
  })

  it('redirects to Login when /auth/me returns 401', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })

  it('shares a single /auth/me request across React StrictMode', async () => {
    vi.mocked(getMe).mockResolvedValue(user)

    const { render } = await import('@testing-library/react')
    const { MemoryRouter } = await import('react-router-dom')
    const { QueryClient, QueryClientProvider } = await import(
      '@tanstack/react-query'
    )
    const { AuthProvider } = await import('./context/AuthContext')
    const App = (await import('./App')).default

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/']}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    )

    expect(await findDashboard()).toBeInTheDocument()
    expect(getMe).toHaveBeenCalledOnce()
  })
})

describe('routing', () => {
  it('does not render the protected home for a guest', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Daily briefing' })).not.toBeInTheDocument()
  })

  it('redirects an authenticated user away from /login', async () => {
    vi.mocked(getMe).mockResolvedValue(user)

    renderApp('/login')

    expect(await findDashboard()).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Sign in' }),
    ).not.toBeInTheDocument()
  })
})

describe('login', () => {
  it('renders the login form', async () => {
    renderApp('/login')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute(
      'href',
      '/signup',
    )
  })

  it('updates the session and navigates after a successful login', async () => {
    const event = userEvent.setup()
    vi.mocked(login).mockResolvedValue(user)

    renderApp('/login')

    await screen.findByRole('heading', { name: 'Sign in' })
    await event.type(screen.getByLabelText('Email'), 'ada@example.com')
    await event.type(screen.getByLabelText('Password'), 'Password1')
    await event.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'Password1',
    })
    expect(await findDashboard()).toBeInTheDocument()
  })

  it('shows an error for wrong credentials', async () => {
    const event = userEvent.setup()
    vi.mocked(login).mockRejectedValue(
      new ApiError(401, 'Invalid email or password', 'Invalid email or password'),
    )

    renderApp('/login')

    await screen.findByRole('heading', { name: 'Sign in' })
    await event.type(screen.getByLabelText('Email'), 'ada@example.com')
    await event.type(screen.getByLabelText('Password'), 'wrong')
    await event.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password',
    )
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})

describe('signup', () => {
  it('renders Name, Email, and Password only', async () => {
    renderApp('/signup')

    expect(
      await screen.findByRole('heading', { name: 'Create account' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
  })

  it('logs in after a successful signup', async () => {
    const event = userEvent.setup()
    vi.mocked(signup).mockResolvedValue(user)
    vi.mocked(login).mockResolvedValue(user)

    renderApp('/signup')

    await screen.findByRole('heading', { name: 'Create account' })
    await event.type(screen.getByLabelText('Name'), 'Ada')
    await event.type(screen.getByLabelText('Email'), 'ada@example.com')
    await event.type(screen.getByLabelText('Password'), 'Password1')
    await event.click(screen.getByRole('button', { name: 'Create account' }))

    expect(signup).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Password1',
    })
    expect(login).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'Password1',
    })
    expect(await findDashboard()).toBeInTheDocument()
  })

  it('redirects to Login when auto-login fails, without a technical error', async () => {
    const event = userEvent.setup()
    vi.mocked(signup).mockResolvedValue(user)
    vi.mocked(login).mockRejectedValue(
      new ApiError(401, 'Invalid email or password', 'Invalid email or password'),
    )

    renderApp('/signup')

    await screen.findByRole('heading', { name: 'Create account' })
    await event.type(screen.getByLabelText('Name'), 'Ada')
    await event.type(screen.getByLabelText('Email'), 'ada@example.com')
    await event.type(screen.getByLabelText('Password'), 'Password1')
    await event.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/auto-login/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a clear error when the email is already registered', async () => {
    const event = userEvent.setup()
    vi.mocked(signup).mockRejectedValue(
      new ApiError(409, 'Email already registered', 'Email already registered'),
    )

    renderApp('/signup')

    await screen.findByRole('heading', { name: 'Create account' })
    await event.type(screen.getByLabelText('Name'), 'Ada')
    await event.type(screen.getByLabelText('Email'), 'ada@example.com')
    await event.type(screen.getByLabelText('Password'), 'Password1')
    await event.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    )
    expect(login).not.toHaveBeenCalled()
  })
})

describe('logout', () => {
  it('calls the logout API, clears the session, and shows Login', async () => {
    const event = userEvent.setup()
    vi.mocked(getMe).mockResolvedValue(user)

    renderApp('/')

    await findDashboard()
    await event.click(screen.getByRole('button', { name: 'Logout' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Daily briefing' }),
    ).not.toBeInTheDocument()
  })
})
