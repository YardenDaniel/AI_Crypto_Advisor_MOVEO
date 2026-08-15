import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitVote } from '../../api/dashboard'
import type {
  AiInsight,
  CoinPricesResponse,
  DashboardFeedback,
  FeedbackVoteInput,
  MarketNewsResponse,
  Meme,
} from '../../types/dashboard'
import {
  DASHBOARD_INSIGHT_QUERY_KEY,
  DASHBOARD_MEME_QUERY_KEY,
  DASHBOARD_NEWS_QUERY_KEY,
  DASHBOARD_PRICES_QUERY_KEY,
} from './queryKeys'

type VoteVariables = {
  feedbackId: number
  value: FeedbackVoteInput
}

function withFeedback<T extends { feedback: DashboardFeedback | null }>(
  current: T | undefined,
  next: DashboardFeedback,
): T | undefined {
  if (!current || current.feedback?.id !== next.id) {
    return current
  }

  return { ...current, feedback: next }
}

export function useDashboardVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ feedbackId, value }: VoteVariables) =>
      submitVote(feedbackId, { value }),
    onSuccess: (feedback) => {
      queryClient.setQueryData(
        DASHBOARD_PRICES_QUERY_KEY,
        (current: CoinPricesResponse | undefined) =>
          withFeedback(current, feedback),
      )

      queryClient.setQueryData(
        DASHBOARD_MEME_QUERY_KEY,
        (current: Meme | undefined) => withFeedback(current, feedback),
      )

      queryClient.setQueryData(
        DASHBOARD_INSIGHT_QUERY_KEY,
        (current: AiInsight | undefined) => withFeedback(current, feedback),
      )

      queryClient.setQueryData(
        DASHBOARD_NEWS_QUERY_KEY,
        (current: MarketNewsResponse | undefined) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            news: current.news.map((item) =>
              item.feedback?.id === feedback.id
                ? { ...item, feedback }
                : item,
            ),
          }
        },
      )
    },
  })
}
