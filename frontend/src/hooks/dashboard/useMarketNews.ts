import { useQuery } from '@tanstack/react-query'
import { getMarketNews } from '../../api/dashboard'
import { DASHBOARD_NEWS_QUERY_KEY } from './queryKeys'

export function useMarketNews() {
  return useQuery({
    queryKey: DASHBOARD_NEWS_QUERY_KEY,
    queryFn: getMarketNews,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
