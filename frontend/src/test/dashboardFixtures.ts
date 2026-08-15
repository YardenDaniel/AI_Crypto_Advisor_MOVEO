import type {
  AiInsight,
  CoinPricesResponse,
  MarketNewsResponse,
  Meme,
} from '../types/dashboard'
import type { Preference } from '../types/preferences'

export const dashboardUser = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
}

export const savedPreferences: Preference = {
  user_id: 1,
  assets: ['BTC', 'ETH'],
  investor_type: 'hodler',
  content_types: ['market_news', 'charts'],
}

export const pricesResponse: CoinPricesResponse = {
  prices: [
    {
      symbol: 'BTC',
      price_usd: 63013.54,
      change_24h: 1.52,
      last_updated_at: 1_710_000_000,
    },
    {
      symbol: 'ETH',
      price_usd: 0.42,
      change_24h: -0.8,
      last_updated_at: null,
    },
    {
      symbol: 'SOL',
      price_usd: 150,
      change_24h: null,
      last_updated_at: null,
    },
  ],
  feedback: { id: 10, vote: 'none', can_vote: true },
}

export const newsResponse: MarketNewsResponse = {
  news: [
    {
      id: 'news-1',
      title: 'Bitcoin rally continues',
      description: 'Traders watch key levels.',
      source: { title: 'CryptoPanic', domain: 'cryptopanic.com' },
      published_at: '2026-08-15',
      instruments: [{ code: 'BTC', title: 'Bitcoin' }],
      url: 'https://example.com/btc',
      image: null,
      origin: 'cryptopanic',
      feedback: { id: 21, vote: 'none', can_vote: true },
    },
    {
      id: 'news-2',
      title: 'Untitled fallback story with a very long headline that should wrap instead of overflowing the dashboard card',
      description: null,
      source: { title: 'Static Briefing', domain: null },
      published_at: null,
      instruments: [],
      url: null,
      image: null,
      origin: 'static_fallback',
      feedback: { id: 22, vote: 'none', can_vote: true },
    },
  ],
}

export const memeResponse: Meme = {
  title: 'HODL through the dip',
  image_url: '/memes/meme1.jpeg',
  source: 'Static',
  source_url: null,
  feedback: { id: 30, vote: 'none', can_vote: true },
}

export const insightResponse: AiInsight = {
  title: 'Stay patient on BTC',
  summary: 'Volatility is cooling after yesterday’s move.',
  key_points: ['BTC holds the range', 'ETH follows with a lag'],
  watch_for: 'A close below the weekly support.',
  risk_note: 'This is informational content, not financial advice.',
  feedback: { id: 40, vote: 'none', can_vote: true },
}
