import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPreferences, getPreferences } from '../api/preferences'
import { isApiError } from '../api/errors'
import { useAuth } from './useAuth'
import type { Preference, PreferenceCreate } from '../types/preferences'

export const PREFERENCES_QUERY_KEY = ['preferences'] as const

export async function fetchPreferences(): Promise<Preference | null> {
  try {
    return await getPreferences()
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null
    }

    throw error
  }
}

export function usePreferences() {
  const { isAuthenticated } = useAuth()

  const query = useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: fetchPreferences,
    enabled: isAuthenticated,
    staleTime: Infinity,
    retry: false,
  })

  return {
    preferences: query.data,
    isLoading: query.isPending && isAuthenticated,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useCreatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PreferenceCreate) => createPreferences(data),
    onSuccess: (preferences) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, preferences)
    },
  })
}
