export type AssetSymbol = 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA'

export type InvestorType = 'hodler' | 'day_trader' | 'nft_collector'

export type ContentType = 'market_news' | 'charts' | 'social' | 'fun'

export type PreferenceCreate = {
  assets: AssetSymbol[]
  investor_type: InvestorType
  content_types: ContentType[]
}

export type PreferenceUpdate = {
  assets?: AssetSymbol[]
  investor_type?: InvestorType
  content_types?: ContentType[]
}

export type Preference = {
  user_id: number
  assets: AssetSymbol[]
  investor_type: InvestorType
  content_types: ContentType[]
}

export const SUPPORTED_ASSETS: AssetSymbol[] = [
  'BTC',
  'ETH',
  'SOL',
  'XRP',
  'ADA',
]

export const SUPPORTED_INVESTOR_TYPES: InvestorType[] = [
  'hodler',
  'day_trader',
  'nft_collector',
]

export const SUPPORTED_CONTENT_TYPES: ContentType[] = [
  'market_news',
  'charts',
  'social',
  'fun',
]
