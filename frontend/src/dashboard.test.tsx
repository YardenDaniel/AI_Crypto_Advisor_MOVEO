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

  it('shows how fresh the provider price data is', async () => {
    // Fixture BTC reports last_updated_at 1_710_000_000 (unix seconds).
    const nowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValue(1_710_000_000_000 + 5 * 60_000)

    try {
      renderApp('/')
      await findDashboard()

      expect(await section('Prices').findByText('BTC')).toBeInTheDocument()
      expect(
        section('Prices').getByText('Updated 5 min ago'),
      ).toBeInTheDocument()
    } finally {
      nowSpy.mockRestore()
    }
  })

  it('omits the freshness label when the provider sends no timestamps', async () => {
    vi.mocked(getCoinPrices).mockResolvedValue({
      ...pricesResponse,
      prices: pricesResponse.prices.map((price) => ({
        ...price,
        last_updated_at: null,
      })),
    })

    renderApp('/')
    await findDashboard()

    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()
    expect(section('Prices').queryByText(/^Updated/)).not.toBeInTheDocument()
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
    expect(
      screen.queryByRole('button', { name: /Enlarge meme/ }),
    ).not.toBeInTheDocument()
  })

  it('opens an enlarged view of the meme and closes it with the close button', async () => {
    const event = userEvent.setup()

    renderApp('/')
    await findDashboard()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await event.click(
      await screen.findByRole('button', {
        name: 'Enlarge meme: HODL through the dip',
      }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('img', { name: 'HODL through the dip' }),
    ).toHaveAttribute('src', '/memes/meme1.jpeg')

    await event.click(
      within(dialog).getByRole('button', { name: 'Close image' }),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('requests a new meme without refetching the other sections', async () => {
    const event = userEvent.setup()
    const replacement = {
      ...memeResponse,
      title: 'Diamond hands',
      image_url: '/memes/meme4.png',
      feedback: { id: 31, vote: 'none' as const, can_vote: true },
    }
    vi.mocked(getMeme)
      .mockResolvedValueOnce(memeResponse)
      .mockResolvedValue(replacement)

    renderApp('/')
    await findDashboard()
    expect(
      await screen.findByRole('img', { name: 'HODL through the dip' }),
    ).toBeInTheDocument()

    expect(getMeme).toHaveBeenCalledOnce()
    expect(getCoinPrices).toHaveBeenCalledOnce()
    expect(getMarketNews).toHaveBeenCalledOnce()
    expect(getAiInsight).toHaveBeenCalledOnce()

    await event.click(
      section('Crypto Meme').getByRole('button', { name: 'New meme' }),
    )

    expect(
      await screen.findByRole('img', { name: 'Diamond hands' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: 'HODL through the dip' }),
    ).not.toBeInTheDocument()

    expect(getMeme).toHaveBeenCalledTimes(2)
    expect(getCoinPrices).toHaveBeenCalledOnce()
    expect(getMarketNews).toHaveBeenCalledOnce()
    expect(getAiInsight).toHaveBeenCalledOnce()
  })

  it('disables New meme while the replacement is loading and keeps the current meme visible', async () => {
    const event = userEvent.setup()
    let resolveSecond: ((value: typeof memeResponse) => void) | undefined
    vi.mocked(getMeme)
      .mockResolvedValueOnce(memeResponse)
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          }),
      )

    renderApp('/')
    await findDashboard()
    expect(
      await screen.findByRole('img', { name: 'HODL through the dip' }),
    ).toBeInTheDocument()

    const newMeme = section('Crypto Meme').getByRole('button', {
      name: 'New meme',
    })
    expect(newMeme).toBeEnabled()

    await event.click(newMeme)

    expect(newMeme).toBeDisabled()
    expect(
      screen.getByRole('img', { name: 'HODL through the dip' }),
    ).toBeInTheDocument()

    resolveSecond?.({ ...memeResponse, title: 'Diamond hands' })

    expect(
      await screen.findByRole('img', { name: 'Diamond hands' }),
    ).toBeInTheDocument()
    await vi.waitFor(() => {
      expect(
        section('Crypto Meme').getByRole('button', { name: 'New meme' }),
      ).toBeEnabled()
    })
  })

  it('keeps the lightbox and voting usable for a replacement meme', async () => {
    const event = userEvent.setup()
    vi.mocked(submitVote).mockResolvedValue({
      id: 30,
      vote: 'up',
      can_vote: false,
    })
    vi.mocked(getMeme)
      .mockResolvedValueOnce(memeResponse)
      .mockResolvedValue({
        ...memeResponse,
        title: 'Diamond hands',
        image_url: '/memes/meme4.png',
        feedback: { id: 31, vote: 'none', can_vote: true },
      })

    renderApp('/')
    await findDashboard()
    expect(
      await screen.findByRole('img', { name: 'HODL through the dip' }),
    ).toBeInTheDocument()

    await event.click(
      section('Crypto Meme').getByRole('button', { name: 'Mark as useful' }),
    )
    expect(submitVote).toHaveBeenCalledWith(30, { value: 'up' })

    await event.click(
      section('Crypto Meme').getByRole('button', { name: 'New meme' }),
    )
    expect(
      await screen.findByRole('img', { name: 'Diamond hands' }),
    ).toBeInTheDocument()

    // The replacement meme can be voted on and enlarged.
    expect(
      section('Crypto Meme').getByText('Was this useful?'),
    ).toBeInTheDocument()

    await event.click(
      screen.getByRole('button', { name: 'Enlarge meme: Diamond hands' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('img', { name: 'Diamond hands' }),
    ).toHaveAttribute('src', '/memes/meme4.png')
  })

  it('closes the enlarged meme with Escape or a click outside it', async () => {
    const event = userEvent.setup()

    renderApp('/')
    await findDashboard()

    const trigger = await screen.findByRole('button', {
      name: 'Enlarge meme: HODL through the dip',
    })

    await event.click(trigger)
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await event.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await event.click(trigger)
    const reopened = await screen.findByRole('dialog')

    await event.click(reopened.parentElement as HTMLElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // Still on the dashboard, no navigation happened.
    expect(
      screen.getByRole('heading', { name: 'Crypto Meme' }),
    ).toBeInTheDocument()
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
    await vi.waitFor(() => {
      expect(
        section('Prices').getByRole('button', { name: 'Mark as useful' }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
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
    await vi.waitFor(() => {
      expect(
        section('Crypto Meme').getByRole('button', {
          name: 'Mark as not useful',
        }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
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
    await vi.waitFor(() => {
      expect(
        section('Prices').getByRole('button', { name: 'Mark as useful' }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
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

  it('hides the feedback area when the backend returns can_vote false', async () => {
    vi.mocked(getCoinPrices).mockResolvedValue({
      ...pricesResponse,
      feedback: { id: 10, vote: 'down', can_vote: false },
    })

    renderApp('/')
    await findDashboard()
    expect(await section('Prices').findByText('BTC')).toBeInTheDocument()

    expect(
      section('Prices').queryByText('Was this useful?'),
    ).not.toBeInTheDocument()
    expect(
      section('Prices').queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()
    expect(
      section('Prices').queryByRole('button', { name: 'Mark as useful' }),
    ).not.toBeInTheDocument()
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
