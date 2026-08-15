import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DASHBOARD_QUERY_KEY } from './queryKeys'

export function useRefreshDashboard() {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function refresh() {
    setIsRefreshing(true)

    try {
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
    } finally {
      setIsRefreshing(false)
    }
  }

  return { refresh, isRefreshing }
}
