<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <h1 class="text-3xl font-bold tracking-tight text-slate-900">Welcome</h1>
    <p class="mt-3 text-slate-600">
      This is a Vue 3 + Vite + TypeScript + Tailwind v4 SPA skeleton, ready for a
      complex application. It uses the Composition API with
      <code class="rounded bg-slate-100 px-1.5 py-0.5 text-sm">&lt;script setup&gt;</code>
      everywhere.
    </p>

    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <RouterLink
        to="/dashboard"
        class="block rounded-lg border border-slate-200 bg-white p-5 hover:border-brand-500 hover:shadow-sm"
      >
        <h2 class="font-semibold text-slate-900">Dashboard</h2>
        <p class="mt-1 text-sm text-slate-500">A simple stateful page using a composable.</p>
      </RouterLink>
      <RouterLink
        to="/about"
        class="block rounded-lg border border-slate-200 bg-white p-5 hover:border-brand-500 hover:shadow-sm"
      >
        <h2 class="font-semibold text-slate-900">About</h2>
        <p class="mt-1 text-sm text-slate-500">Project stack and conventions.</p>
      </RouterLink>
    </div>
  </section>
</template>
