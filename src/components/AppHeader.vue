<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
      <RouterLink to="/" class="text-lg font-semibold tracking-tight">
        <span class="text-brand-600">Tests</span> Frontend
      </RouterLink>
      <nav class="flex items-center gap-1 text-sm">
        <RouterLink
          v-for="link in [
            { to: '/', label: 'Home' },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/about', label: 'About' },
          ]"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
