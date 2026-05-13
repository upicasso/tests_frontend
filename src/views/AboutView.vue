<script setup lang="ts">
const stack = [
  { name: 'Vue 3', detail: 'Composition API + <script setup>' },
  { name: 'Vite 6', detail: 'Dev server & bundler' },
  { name: 'TypeScript', detail: 'Strict mode enabled' },
  { name: 'Tailwind CSS v4', detail: 'CSS-first config via @theme' },
  { name: 'Vue Router 4', detail: 'Lazy-loaded routes + layouts' },
] as const
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <h1 class="text-2xl font-semibold text-slate-900">About</h1>
    <p class="mt-1 text-sm text-slate-500">Tech stack used in this skeleton.</p>

    <ul class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      <li v-for="item in stack" :key="item.name" class="flex items-center justify-between px-5 py-3">
        <span class="font-medium text-slate-900">{{ item.name }}</span>
        <span class="text-sm text-slate-500">{{ item.detail }}</span>
      </li>
    </ul>
  </section>
</template>
