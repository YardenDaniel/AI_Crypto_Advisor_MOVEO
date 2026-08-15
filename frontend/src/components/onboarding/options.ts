import type {
  AssetSymbol,
  ContentType,
  InvestorType,
} from '../../types/preferences'

export const ASSET_OPTIONS: {
  value: AssetSymbol
  label: string
  description: string
}[] = [
  { value: 'BTC', label: 'BTC', description: 'Bitcoin' },
  { value: 'ETH', label: 'ETH', description: 'Ethereum' },
  { value: 'SOL', label: 'SOL', description: 'Solana' },
  { value: 'XRP', label: 'XRP', description: 'XRP' },
  { value: 'ADA', label: 'ADA', description: 'Cardano' },
]

export const INVESTOR_OPTIONS: {
  value: InvestorType
  label: string
  description: string
}[] = [
  {
    value: 'hodler',
    label: 'HODLer',
    description: 'Long-term conviction, less day-to-day noise.',
  },
  {
    value: 'day_trader',
    label: 'Day Trader',
    description: 'Shorter moves, prices, and market timing.',
  },
  {
    value: 'nft_collector',
    label: 'NFT Collector',
    description: 'Culture, collections, and on-chain trends.',
  },
]

export const CONTENT_OPTIONS: {
  value: ContentType
  label: string
  description: string
}[] = [
  {
    value: 'market_news',
    label: 'Market News',
    description: 'Headlines that affect your selected assets.',
  },
  {
    value: 'charts',
    label: 'Charts',
    description: 'Price levels and 24-hour change.',
  },
  {
    value: 'social',
    label: 'Social',
    description: 'What traders and communities are talking about.',
  },
  {
    value: 'fun',
    label: 'Fun',
    description: 'A daily crypto meme with your briefing.',
  },
]
