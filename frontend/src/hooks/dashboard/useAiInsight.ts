import { useQuery } from '@tanstack/react-query'
import { getAiInsight } from '../../api/dashboard'
import { DASHBOARD_INSIGHT_QUERY_KEY } from './queryKeys'

export function useAiInsight() {
  return useQuery({
    queryKey: DASHBOARD_INSIGHT_QUERY_KEY,
    queryFn: getAiInsight,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
