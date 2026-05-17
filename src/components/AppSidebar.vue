<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()

const sections = computed(() => [
  {
    title: 'Tests',
    items: [{ to: '/', label: 'Browse tests' }],
  },
  {
    title: 'Account',
    items: auth.isAuthenticated.value
      ? []
      : [
          { to: '/login', label: 'Sign in' },
          { to: '/register', label: 'Register' },
        ],
  },
])
</script>

<template>
  <aside class="w-60 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
    <nav class="space-y-6 text-sm">
      <div v-for="section in sections" :key="section.title">
        <p
          v-if="section.items.length"
          class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400"
        >
          {{ section.title }}
        </p>
        <ul v-if="section.items.length" class="space-y-0.5">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink
              :to="item.to"
              class="block rounded-md px-2 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              active-class="bg-brand-50 text-brand-700"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
      <div v-if="auth.isAuthenticated.value" class="px-2">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Signed in</p>
        <p class="mt-1 text-slate-700">{{ auth.user.value?.email }}</p>
      </div>
    </nav>
  </aside>
</template>
