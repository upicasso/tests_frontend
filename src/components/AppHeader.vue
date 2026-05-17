<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const auth = useAuth()
const message = useMessage()

const displayName = computed(() => {
  const u = auth.user.value
  if (!u) return ''
  return `${u.firstName} ${u.lastName}`.trim() || u.email
})

function logout() {
  auth.logout()
  message.success('Signed out.')
  router.push({ name: 'tests' })
}
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
      <RouterLink to="/" class="text-lg font-semibold tracking-tight">
        <span class="text-brand-600">Interview</span> Tests
      </RouterLink>
      <nav class="flex items-center gap-2 text-sm">
        <RouterLink
          to="/"
          class="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
        >
          Tests
        </RouterLink>
        <template v-if="auth.isAuthenticated.value">
          <n-text class="hidden px-2 sm:inline">{{ displayName }}</n-text>
          <n-button quaternary size="small" @click="logout">Sign out</n-button>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <n-button quaternary size="small">Sign in</n-button>
          </RouterLink>
          <RouterLink to="/register">
            <n-button type="primary" size="small">Register</n-button>
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
