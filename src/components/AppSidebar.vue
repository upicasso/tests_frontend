<script setup lang="ts">
import { RouterLink } from 'vue-router'

const sections = [
  {
    title: 'Workspace',
    items: [
      { to: '/', label: 'Overview' },
      { to: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Project',
    items: [{ to: '/about', label: 'About' }],
  },
] as const
</script>

<template>
  <aside class="w-60 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
    <nav class="space-y-6 text-sm">
      <div v-for="section in sections" :key="section.title">
        <p class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {{ section.title }}
        </p>
        <ul class="space-y-0.5">
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
    </nav>
  </aside>
</template>
