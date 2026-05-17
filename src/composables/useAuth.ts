import { computed, ref, shallowRef } from 'vue'
import * as authApi from '@/api/auth'
import { ApiError, getStoredToken, setStoredToken } from '@/api/client'
import type { LoginRequest, RegisterUserRequest, UserProfile } from '@/types/api'

const user = shallowRef<UserProfile | null>(null)
const loading = ref(false)
const initialized = ref(false)

async function loadProfile(): Promise<void> {
  const token = getStoredToken()
  if (!token) {
    user.value = null
    return
  }
  try {
    user.value = await authApi.fetchMe()
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      setStoredToken(null)
      user.value = null
    } else {
      throw e
    }
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  async function init(): Promise<void> {
    if (initialized.value) return
    loading.value = true
    try {
      await loadProfile()
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true
    try {
      const { token } = await authApi.login(credentials)
      setStoredToken(token)
      await loadProfile()
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterUserRequest): Promise<void> {
    loading.value = true
    try {
      await authApi.register(payload)
      await login({ email: payload.email, password: payload.password })
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    setStoredToken(null)
    user.value = null
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    init,
    login,
    register,
    logout,
  }
}
