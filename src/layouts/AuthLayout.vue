<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="flex min-h-full flex-col bg-slate-50">
    <header class="border-b border-slate-200 bg-white px-6 py-4">
      <RouterLink to="/" class="text-lg font-semibold tracking-tight">
        <span class="text-brand-600">Interview</span> Tests
      </RouterLink>
    </header>
    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>
  </div>
</template>
