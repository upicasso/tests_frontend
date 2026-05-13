<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-7xl px-6 py-4 text-sm text-slate-500">
      &copy; {{ year }} Tests Frontend
    </div>
  </footer>
</template>
