import { apiRequest } from './client'
import type { LoginRequest, SignupRequest, User } from '../types/auth'

export function signup(data: SignupRequest): Promise<User> {
  return apiRequest<User>('/auth/signup', {
    method: 'POST',
    body: data,
  })
}

export function login(data: LoginRequest): Promise<User> {
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    body: data,
  })
}

export function getMe(): Promise<User> {
  return apiRequest<User>('/auth/me')
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}
