<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
    <p class="text-sm font-semibold text-brand-600">404</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
    <p class="mt-2 text-slate-500">The page you’re looking for doesn’t exist.</p>
    <RouterLink
      to="/"
      class="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
    >
      Go home
    </RouterLink>
  </section>
</template>
