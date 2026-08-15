import { apiRequest } from './client'
import type {
  AiInsight,
  CoinPricesResponse,
  DashboardFeedback,
  DashboardVoteCreate,
  MarketNewsResponse,
  Meme,
} from '../types/dashboard'

export function getCoinPrices(): Promise<CoinPricesResponse> {
  return apiRequest<CoinPricesResponse>('/dashboard/prices')
}

export function getMarketNews(): Promise<MarketNewsResponse> {
  return apiRequest<MarketNewsResponse>('/dashboard/news')
}

export function getMeme(): Promise<Meme> {
  return apiRequest<Meme>('/dashboard/meme')
}

export function getAiInsight(): Promise<AiInsight> {
  return apiRequest<AiInsight>('/dashboard/insight')
}

export function submitVote(
  feedbackId: number,
  data: DashboardVoteCreate,
): Promise<DashboardFeedback> {
  return apiRequest<DashboardFeedback>(
    `/dashboard/feedback/${feedbackId}/vote`,
    {
      method: 'POST',
      body: data,
    },
  )
}
