import { useQuery } from '@tanstack/react-query'
import { getCoinPrices } from '../../api/dashboard'
import { DASHBOARD_PRICES_QUERY_KEY } from './queryKeys'

export function useCoinPrices() {
  return useQuery({
    queryKey: DASHBOARD_PRICES_QUERY_KEY,
    queryFn: getCoinPrices,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
