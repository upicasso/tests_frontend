<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

const { count, isPositive, increment, decrement, reset } = useCounter(0)
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
    <p class="mt-1 text-sm text-slate-500">
      Example of using a composable (<code>useCounter</code>) with reactive state.
    </p>

    <div class="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <div class="flex items-baseline gap-3">
        <span class="text-4xl font-bold tabular-nums" :class="isPositive ? 'text-brand-600' : 'text-slate-400'">
          {{ count }}
        </span>
        <span class="text-sm text-slate-500">current value</span>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          @click="increment"
        >
          + Increment
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="decrement"
        >
          − Decrement
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          @click="reset"
        >
          Reset
        </button>
      </div>
    </div>
  </section>
</template>
