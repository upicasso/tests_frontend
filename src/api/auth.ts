import { apiFetch } from '@/api/client'
import type {
  JwtTokenResponse,
  LoginRequest,
  RegisterUserRequest,
  UserProfile,
  UserRegistered,
} from '@/types/api'

export function login(credentials: LoginRequest) {
  return apiFetch<JwtTokenResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    auth: false,
  })
}

export function register(payload: RegisterUserRequest) {
  return apiFetch<UserRegistered>('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  })
}

export function fetchMe() {
  return apiFetch<UserProfile>('/api/me')
}
