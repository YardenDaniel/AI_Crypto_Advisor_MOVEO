import { apiRequest } from './client'
import type {
  Preference,
  PreferenceCreate,
  PreferenceUpdate,
} from '../types/preferences'

export function getPreferences(): Promise<Preference> {
  return apiRequest<Preference>('/preferences')
}

export function createPreferences(data: PreferenceCreate): Promise<Preference> {
  return apiRequest<Preference>('/preferences', {
    method: 'POST',
    body: data,
  })
}

export function updatePreferences(data: PreferenceUpdate): Promise<Preference> {
  return apiRequest<Preference>('/preferences', {
    method: 'PATCH',
    body: data,
  })
}
