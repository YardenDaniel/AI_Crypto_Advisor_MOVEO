import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getMe, logout } from './api/auth'
import { getPreferences } from './api/preferences'
import {
  getAiInsight,
  getCoinPrices,
  getMarketNews,
  getMeme,
  submitVote,
} from './api/dashboard'
import { ApiError } from './api/errors'
import { resetAuthSessionCache } from './context/AuthContext'
import { findDashboard, renderApp } from './test/renderApp'
import {
  dashboardUser,
  insightResponse,
  memeResponse,
  newsResponse,
  pricesResponse,
  savedPreferences,
} from './test/dashboardFixtures'

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

function section(name: string) {
  const heading = screen.getByRole('heading', { name })
  const region = heading.closest('section')

  if (!region) {
    throw new Error(`Section not found: ${name}`)
  }

  return within(region)
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
  vi.mocked(submitVote).mockReset()
  vi.mocked(getMe).mockResolvedValue(dashboardUser)
  vi.mocked(logout).mockResolvedValue(undefined)
  vi.mocked(getPreferences).mockResolvedValue(savedPreferences)
  vi.mocked(getCoinPrices).mockResolvedValue(pricesResponse)
  vi.mocked(getMarketNews).mockResolvedValue(newsResponse)
  vi.mocked(getMeme).mockResolvedValue(memeResponse)
  vi.mocked(getAiInsight).mockResolvedValue(insightResponse)
})

describe('prices', () => {
  it('shows a loading skeleton, then successful prices and feedback', async () => {
    let resolvePrices: ((value: typeof pricesResponse) => void) | undefined
    vi.mocked(getCoinPrices).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePrices = resolve
        }),
    )

    renderApp('/')
    await findDashboard()

    expect(screen.getByRole('heading', { name: 'Prices' })).toBeInTheDocument()
    expect(section('Prices').queryByText('BTC')).not.toBeInTheDocument()

    resolvePrices?.(pricesResponse)

    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()
    expect(section('Prices').getByText('$63,013.54')).toBeInTheDocument()
    expect(section('Prices').getByText('+1.52%')).toBeInTheDocument()
    expect(section('Prices').getByText('ETH')).toBeInTheDocument()
    expect(section('Prices').getByText('$0.4200')).toBeInTheDocument()
    expect(section('Prices').getByText('-0.80%')).toBeInTheDocument()
    expect(section('Prices').getByText('SOL')).toBeInTheDocument()
    expect(section('Prices').getByText('—')).toBeInTheDocument()
    expect(
      section('Prices').getByText('Was this useful?'),
    ).toBeInTheDocument()
  })

  it('handles an empty prices list without crashing', async () => {
    vi.mocked(getCoinPrices).mockResolvedValue({
      prices: [],
      feedback: pricesResponse.feedback,
    })

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText(/No prices to show right now/),
    ).toBeInTheDocument()
    expect(section('Prices').getByText('Was this useful?')).toBeInTheDocument()
  })

  it('shows a recoverable prices error with Retry', async () => {
    const event = userEvent.setup()
    vi.mocked(getCoinPrices)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(pricesResponse)

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText(/Prices are unavailable right now/),
    ).toBeInTheDocument()

    await event.click(section('Prices').getByRole('button', { name: 'Retry' }))

    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()
  })
})

describe('news', () => {
  it('renders articles, optional fields, and per-article votes', async () => {
    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText('Bitcoin rally continues'),
    ).toBeInTheDocument()
    expect(screen.getByText(/CryptoPanic/)).toBeInTheDocument()
    expect(screen.getByText(/Aug 15, 2026/)).toBeInTheDocument()
    expect(section('Market News').getByText('BTC')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Bitcoin rally continues/ }),
    ).toHaveAttribute('href', 'https://example.com/btc')
    expect(
      screen.getByRole('link', { name: /opens in a new tab/ }),
    ).toHaveAttribute('rel', 'noopener noreferrer')

    expect(
      screen.getByText(/Untitled fallback story/),
    ).toBeInTheDocument()
    expect(screen.queryByText('static_fallback')).not.toBeInTheDocument()
    expect(
      section('Market News').getAllByText('Was this useful?'),
    ).toHaveLength(2)
  })

  it('shows an empty news state', async () => {
    vi.mocked(getMarketNews).mockResolvedValue({ news: [] })

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText('No market news to show right now.'),
    ).toBeInTheDocument()
  })

  it('shows a recoverable news error', async () => {
    vi.mocked(getMarketNews).mockRejectedValue(new Error('network'))

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText(/Market news is unavailable right now/),
    ).toBeInTheDocument()
    expect(
      section('Market News').getByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument()
  })
})

describe('meme', () => {
  it('renders a frontend /memes path without prefixing the API origin', async () => {
    renderApp('/')
    await findDashboard()

    const image = await screen.findByRole('img', { name: 'HODL through the dip' })
    expect(image).toHaveAttribute('src', '/memes/meme1.jpeg')
    expect(section('Crypto Meme').getByText('Was this useful?')).toBeInTheDocument()
  })

  it('renders an absolute Reddit image URL unchanged', async () => {
    vi.mocked(getMeme).mockResolvedValue({
      ...memeResponse,
      image_url: 'https://i.redd.it/abc.jpg',
      source: 'Reddit',
      source_url: 'https://reddit.com/r/cryptomemes',
    })

    renderApp('/')
    await findDashboard()

    const image = await screen.findByRole('img', { name: 'HODL through the dip' })
    expect(image).toHaveAttribute('src', 'https://i.redd.it/abc.jpg')
    expect(
      screen.getByRole('link', { name: /Reddit/ }),
    ).toHaveAttribute('href', 'https://reddit.com/r/cryptomemes')
  })

  it('handles a missing meme image', async () => {
    vi.mocked(getMeme).mockResolvedValue({
      ...memeResponse,
      image_url: null,
    })

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText('Meme image is unavailable.'),
    ).toBeInTheDocument()
    expect(screen.getByText('HODL through the dip')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

describe('AI insight', () => {
  it('shows a generating state, then the insight and feedback', async () => {
    let resolveInsight: ((value: typeof insightResponse) => void) | undefined
    vi.mocked(getAiInsight).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInsight = resolve
        }),
    )

    renderApp('/')
    await findDashboard()

    expect(
      screen.getByText('Generating your personalized insight…'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('You can keep browsing while we generate this.'),
    ).toBeInTheDocument()

    resolveInsight?.(insightResponse)

    expect(await screen.findByText('Stay patient on BTC')).toBeInTheDocument()
    expect(
      screen.getByText('Volatility is cooling after yesterday’s move.'),
    ).toBeInTheDocument()
    expect(screen.getByText('BTC holds the range')).toBeInTheDocument()
    expect(screen.getByText(/weekly support/)).toBeInTheDocument()
    expect(screen.getByText(/not financial advice/)).toBeInTheDocument()
    expect(section('AI Insight').getByText('Was this useful?')).toBeInTheDocument()
  })

  it('shows a friendly 502 state with Retry', async () => {
    const event = userEvent.setup()
    vi.mocked(getAiInsight)
      .mockRejectedValueOnce(
        new ApiError(
          502,
          'AI insight is temporarily unavailable. Please try again later.',
          'AI insight is temporarily unavailable. Please try again later.',
        ),
      )
      .mockResolvedValue(insightResponse)

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText('AI insight is temporarily unavailable.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/OpenRouter/i)).not.toBeInTheDocument()

    await event.click(section('AI Insight').getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Stay patient on BTC')).toBeInTheDocument()
  })
})

describe('voting', () => {
  it('sends an up vote payload and then becomes read-only', async () => {
    const event = userEvent.setup()
    vi.mocked(submitVote).mockResolvedValue({
      id: 10,
      vote: 'up',
      can_vote: false,
    })

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    await event.click(
      section('Prices').getByRole('button', { name: 'Mark as useful' }),
    )

    expect(submitVote).toHaveBeenCalledWith(10, { value: 'up' })
    expect(
      await section('Prices').findByText('You marked this as useful'),
    ).toBeInTheDocument()
    expect(
      section('Prices').getByRole('button', { name: 'Mark as useful' }),
    ).toBeDisabled()
    expect(
      section('Prices').getByRole('button', { name: 'Mark as not useful' }),
    ).toBeDisabled()
  })

  it('sends a down vote payload', async () => {
    const event = userEvent.setup()
    vi.mocked(submitVote).mockResolvedValue({
      id: 30,
      vote: 'down',
      can_vote: false,
    })

    renderApp('/')
    await screen.findByText('HODL through the dip')

    await event.click(
      section('Crypto Meme').getByRole('button', { name: 'Mark as not useful' }),
    )

    expect(submitVote).toHaveBeenCalledWith(30, { value: 'down' })
    expect(
      await section('Crypto Meme').findByText('You marked this as not useful'),
    ).toBeInTheDocument()
  })

  it('prevents a duplicate submission while a vote is pending', async () => {
    const event = userEvent.setup()
    let resolveVote: ((value: { id: number; vote: 'up'; can_vote: false }) => void) | undefined
    vi.mocked(submitVote).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveVote = resolve
        }),
    )

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    const up = section('Prices').getByRole('button', { name: 'Mark as useful' })
    await event.click(up)
    await event.click(
      section('Prices').getByRole('button', { name: 'Mark as not useful' }),
    )

    expect(submitVote).toHaveBeenCalledOnce()

    resolveVote?.({ id: 10, vote: 'up', can_vote: false })
    expect(
      await section('Prices').findByText('You marked this as useful'),
    ).toBeInTheDocument()
  })

  it('does not update the UI when voting fails', async () => {
    const event = userEvent.setup()
    vi.mocked(submitVote).mockRejectedValue(new Error('network'))

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    await event.click(
      section('Prices').getByRole('button', { name: 'Mark as useful' }),
    )

    expect(await section('Prices').findByText('Was this useful?')).toBeInTheDocument()
    expect(
      section('Prices').getByRole('button', { name: 'Mark as useful' }),
    ).toBeEnabled()
  })

  it('does not allow voting again after the backend returns can_vote false', async () => {
    vi.mocked(getCoinPrices).mockResolvedValue({
      ...pricesResponse,
      feedback: { id: 10, vote: 'down', can_vote: false },
    })

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    expect(
      section('Prices').getByText('You marked this as not useful'),
    ).toBeInTheDocument()
    expect(
      section('Prices').getByRole('button', { name: 'Mark as useful' }),
    ).toBeDisabled()
  })
})

describe('dashboard independence', () => {
  it('still renders successful sections when one query fails', async () => {
    vi.mocked(getCoinPrices).mockRejectedValue(new Error('network'))

    renderApp('/')
    await findDashboard()

    expect(
      await screen.findByText(/Prices are unavailable right now/),
    ).toBeInTheDocument()
    expect(await screen.findByText('Bitcoin rally continues')).toBeInTheDocument()
    expect(screen.getByText('Stay patient on BTC')).toBeInTheDocument()
    expect(screen.getByText('HODL through the dip')).toBeInTheDocument()
  })
})

describe('dashboard refresh', () => {
  it('refetches all four dashboard queries without touching auth or preferences', async () => {
    const event = userEvent.setup()

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    expect(getCoinPrices).toHaveBeenCalledOnce()
    expect(getMarketNews).toHaveBeenCalledOnce()
    expect(getMeme).toHaveBeenCalledOnce()
    expect(getAiInsight).toHaveBeenCalledOnce()
    expect(getPreferences).toHaveBeenCalledOnce()
    expect(getMe).toHaveBeenCalledOnce()

    await event.click(screen.getByRole('button', { name: 'Refresh dashboard' }))

    await vi.waitFor(() => {
      expect(getCoinPrices).toHaveBeenCalledTimes(2)
      expect(getMarketNews).toHaveBeenCalledTimes(2)
      expect(getMeme).toHaveBeenCalledTimes(2)
      expect(getAiInsight).toHaveBeenCalledTimes(2)
    })

    expect(getPreferences).toHaveBeenCalledOnce()
    expect(getMe).toHaveBeenCalledOnce()
  })
})
