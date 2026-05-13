<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="flex min-h-full flex-col">
    <AppHeader />
    <div class="flex flex-1">
      <AppSidebar class="hidden md:block" />
      <main class="flex-1 px-6 py-8">
        <RouterView />
      </main>
    </div>
    <AppFooter />
  </div>
</template>
