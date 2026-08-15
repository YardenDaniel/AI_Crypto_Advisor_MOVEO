import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe, logout } from './api/auth'
import { getPreferences } from './api/preferences'
import {
  getAiInsight,
  getCoinPrices,
  getMarketNews,
  getMeme,
} from './api/dashboard'
import { resetAuthSessionCache } from './context/AuthContext'
import { findDashboard, renderApp } from './test/renderApp'
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

const user = {
  id: 1,
  name: 'Ada Lovelace',
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
  vi.mocked(logout).mockReset()
  vi.mocked(getPreferences).mockReset()
  vi.mocked(getCoinPrices).mockReset()
  vi.mocked(getMarketNews).mockReset()
  vi.mocked(getMeme).mockReset()
  vi.mocked(getAiInsight).mockReset()
  vi.mocked(getMe).mockResolvedValue(user)
  vi.mocked(logout).mockResolvedValue(undefined)
  vi.mocked(getPreferences).mockResolvedValue(savedPreferences)
})

describe('dashboard shell', () => {
  it('renders the dashboard for an authenticated onboarded user', async () => {
    renderApp('/')

    expect(await findDashboard()).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Logout' }),
    ).toBeInTheDocument()
  })

  it('renders all four section headings', async () => {
    renderApp('/')

    await findDashboard()

    expect(screen.getByRole('heading', { name: 'Prices' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'AI Insight' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Market News' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Crypto Meme' }),
    ).toBeInTheDocument()
  })

  it('keeps logout as an accessible button that signs the user out', async () => {
    const event = userEvent.setup()

    renderApp('/')

    await findDashboard()
    await event.click(screen.getByRole('button', { name: 'Logout' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
  })

  it('does not fetch dashboard APIs yet', async () => {
    renderApp('/')

    await findDashboard()

    expect(getCoinPrices).not.toHaveBeenCalled()
    expect(getMarketNews).not.toHaveBeenCalled()
    expect(getMeme).not.toHaveBeenCalled()
    expect(getAiInsight).not.toHaveBeenCalled()
  })
})
