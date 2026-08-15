export type FeedbackVote = 'none' | 'up' | 'down'

export type FeedbackVoteInput = 'up' | 'down'

export type DashboardFeedback = {
  id: number
  vote: FeedbackVote
  can_vote: boolean
}

export type DashboardVoteCreate = {
  value: FeedbackVoteInput
}

export type CoinPrice = {
  symbol: string
  price_usd: number
  change_24h: number | null
  last_updated_at: number | null
}

export type CoinPricesResponse = {
  prices: CoinPrice[]
  feedback: DashboardFeedback | null
}

export type NewsSource = {
  title: string
  domain: string | null
}

export type NewsInstrument = {
  code: string
  title: string | null
}

export type MarketNewsItem = {
  id: string
  title: string
  description: string | null
  source: NewsSource
  published_at: string | null
  instruments: NewsInstrument[]
  url: string | null
  image: string | null
  origin: string
  feedback: DashboardFeedback | null
}

export type MarketNewsResponse = {
  news: MarketNewsItem[]
}

export type Meme = {
  title: string
  image_url: string | null
  source: string
  source_url: string | null
  feedback: DashboardFeedback | null
}

export type AiInsight = {
  title: string
  summary: string
  key_points: string[]
  watch_for: string
  risk_note: string
  feedback: DashboardFeedback | null
}
