import { useQuery } from '@tanstack/react-query'
import { getMeme } from '../../api/dashboard'
import { DASHBOARD_MEME_QUERY_KEY } from './queryKeys'

export function useMeme() {
  return useQuery({
    queryKey: DASHBOARD_MEME_QUERY_KEY,
    queryFn: getMeme,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
