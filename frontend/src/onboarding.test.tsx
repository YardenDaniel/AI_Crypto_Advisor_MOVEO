import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe } from './api/auth'
import { createPreferences, getPreferences } from './api/preferences'
import {
  getAiInsight,
  getCoinPrices,
  getMarketNews,
  getMeme,
} from './api/dashboard'
import { ApiError } from './api/errors'
import { resetAuthSessionCache } from './context/AuthContext'
import { PREFERENCES_QUERY_KEY } from './hooks/usePreferences'
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

const notFound = new ApiError(404, 'Preferences not found', 'Preferences not found')

afterEach(() => {
  resetAuthSessionCache()
})

beforeEach(() => {
  vi.mocked(getMe).mockReset()
  vi.mocked(getPreferences).mockReset()
  vi.mocked(createPreferences).mockReset()
  vi.mocked(getCoinPrices).mockReset()
  vi.mocked(getMarketNews).mockReset()
  vi.mocked(getMeme).mockReset()
  vi.mocked(getAiInsight).mockReset()
  vi.mocked(getMe).mockResolvedValue(user)
  vi.mocked(getPreferences).mockRejectedValue(notFound)
  vi.mocked(getCoinPrices).mockResolvedValue(pricesResponse)
  vi.mocked(getMarketNews).mockResolvedValue(newsResponse)
  vi.mocked(getMeme).mockResolvedValue(memeResponse)
  vi.mocked(getAiInsight).mockResolvedValue(insightResponse)
})

async function completeWizard(
  event: ReturnType<typeof userEvent.setup>,
) {
  await screen.findByText('Step 1 of 3')
  await event.click(screen.getByRole('button', { name: /BTC/ }))
  await event.click(screen.getByRole('button', { name: 'Continue' }))
  await event.click(screen.getByRole('radio', { name: /HODLer/ }))
  await event.click(screen.getByRole('button', { name: 'Continue' }))
  await event.click(screen.getByRole('button', { name: /^Fun/ }))
  await event.click(screen.getByRole('button', { name: 'Finish setup' }))
}

describe('preference gate', () => {
  it('sends an authenticated user with preferences to home', async () => {
    vi.mocked(getPreferences).mockResolvedValue(savedPreferences)

    renderApp('/')

    expect(await findDashboard()).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prices' })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Personalize your daily briefing/ }),
    ).not.toBeInTheDocument()
  })

  it('sends an authenticated user without preferences to onboarding', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', {
        name: 'Personalize your daily briefing',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Daily briefing' }),
    ).not.toBeInTheDocument()
  })

  it('redirects a completed user away from /onboarding', async () => {
    vi.mocked(getPreferences).mockResolvedValue(savedPreferences)

    renderApp('/onboarding')

    expect(await findDashboard()).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /Personalize your daily briefing/ }),
    ).not.toBeInTheDocument()
  })
})

describe('onboarding wizard', () => {
  it('starts at Step 1 with Continue disabled until an asset is selected', async () => {
    const event = userEvent.setup()

    renderApp('/onboarding')

    expect(await screen.findByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await event.click(screen.getByRole('button', { name: /BTC/ }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('moves to investor and content steps, and Back keeps previous selections', async () => {
    const event = userEvent.setup()

    renderApp('/onboarding')

    await screen.findByText('Step 1 of 3')
    await event.click(screen.getByRole('button', { name: /ETH/ }))
    await event.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Step 2 of 3')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'How do you invest?' }),
    ).toBeInTheDocument()

    await event.click(screen.getByRole('radio', { name: /Day Trader/ }))
    await event.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Step 3 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Finish setup' })).toBeDisabled()

    await event.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Day Trader/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    await event.click(screen.getByRole('button', { name: 'Back' }))

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ETH/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('requires at least one content type before finishing', async () => {
    const event = userEvent.setup()

    renderApp('/onboarding')

    await screen.findByText('Step 1 of 3')
    await event.click(screen.getByRole('button', { name: /SOL/ }))
    await event.click(screen.getByRole('button', { name: 'Continue' }))
    await event.click(screen.getByRole('radio', { name: /NFT Collector/ }))
    await event.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('button', { name: 'Finish setup' })).toBeDisabled()

    await event.click(screen.getByRole('button', { name: /Market News/ }))

    expect(screen.getByRole('button', { name: 'Finish setup' })).toBeEnabled()
  })
})

describe('onboarding submit', () => {
  it('POSTs exact backend enum values and then shows home', async () => {
    const event = userEvent.setup()
    vi.mocked(createPreferences).mockResolvedValue(savedPreferences)

    const { queryClient } = renderApp('/onboarding')

    await completeWizard(event)

    expect(createPreferences).toHaveBeenCalledWith({
      assets: ['BTC'],
      investor_type: 'hodler',
      content_types: ['fun'],
    })
    expect(queryClient.getQueryData(PREFERENCES_QUERY_KEY)).toEqual(
      savedPreferences,
    )
    expect(await findDashboard()).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Prices' })).toBeInTheDocument()
  })

  it('treats 409 as already onboarded and continues to home', async () => {
    const event = userEvent.setup()
    vi.mocked(createPreferences).mockRejectedValue(
      new ApiError(409, 'Preferences already exist', 'Preferences already exist'),
    )
    vi.mocked(getPreferences)
      .mockRejectedValueOnce(notFound)
      .mockResolvedValue(savedPreferences)

    renderApp('/onboarding')

    await completeWizard(event)

    expect(await findDashboard()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps the wizard on a 422 and shows the error', async () => {
    const event = userEvent.setup()
    vi.mocked(createPreferences).mockRejectedValue(
      new ApiError(422, 'Unsupported assets: DOGE', 'Unsupported assets: DOGE'),
    )

    renderApp('/onboarding')

    await completeWizard(event)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unsupported assets: DOGE',
    )
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Finish setup' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Daily briefing' }),
    ).not.toBeInTheDocument()
  })
})

describe('onboarding auth', () => {
  it('sends an unauthenticated visitor from /onboarding to Login', async () => {
    vi.mocked(getMe).mockRejectedValue(
      new ApiError(401, 'Not authenticated', 'Not authenticated'),
    )

    renderApp('/onboarding')

    expect(
      await screen.findByRole('heading', { name: 'Sign in' }),
    ).toBeInTheDocument()
    expect(getPreferences).not.toHaveBeenCalled()
  })
})
