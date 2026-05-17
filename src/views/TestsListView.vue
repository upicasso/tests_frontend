<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTests } from '@/api/tests'
import { ApiError } from '@/api/client'
import type { PaginationMeta, TestResource } from '@/types/api'

const router = useRouter()
const message = useMessage()

const tests = ref<TestResource[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const nameFilter = ref('')
const page = ref(1)
const limit = ref(10)

async function loadTests() {
  loading.value = true
  try {
    const response = await fetchTests({
      page: page.value,
      limit: limit.value,
      name: nameFilter.value.trim() || undefined,
    })
    tests.value = response.data
    pagination.value = response.meta.pagination
  } catch (e) {
    message.error(e instanceof ApiError ? e.message : 'Failed to load tests.')
  } finally {
    loading.value = false
  }
}

function openTest(test: TestResource) {
  router.push({
    name: 'test-take',
    params: { testId: test.id },
    state: {
      testName: test.attributes.name,
      testDescription: test.attributes.description,
    },
  })
}

function onSearch() {
  page.value = 1
  loadTests()
}

onMounted(loadTests)
watch(page, loadTests)
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Interview tests</h1>
      <p class="mt-2 text-slate-600">
        Browse available tests and start answering questions. Sign in to submit your answers.
      </p>
    </div>

    <n-card class="mb-6">
      <n-space align="center" :wrap="true">
        <n-input
          v-model:value="nameFilter"
          placeholder="Filter by name…"
          clearable
          class="min-w-48"
          @keyup.enter="onSearch"
        />
        <n-button type="primary" :loading="loading" @click="onSearch">Search</n-button>
      </n-space>
    </n-card>

    <n-spin :show="loading">
      <n-empty
        v-if="!loading && tests.length === 0"
        description="No tests found. Load fixtures on the backend (doctrine:fixtures:load)."
      />
      <n-space v-else vertical size="large">
        <n-card
          v-for="test in tests"
          :key="test.id"
          hoverable
          class="cursor-pointer"
          @click="openTest(test)"
        >
          <template #header>
            <span class="font-semibold text-slate-900">{{ test.attributes.name }}</span>
          </template>
          <p class="text-slate-600">{{ test.attributes.description }}</p>
          <template #footer>
            <n-space justify="space-between" align="center">
              <n-text depth="3" class="text-sm">
                Created {{ new Date(test.attributes.createdAt).toLocaleDateString() }}
              </n-text>
              <n-button type="primary" size="small" @click.stop="openTest(test)">
                Start test
              </n-button>
            </n-space>
          </template>
        </n-card>
      </n-space>

      <div v-if="pagination && pagination.pages > 1" class="mt-8 flex justify-center">
        <n-pagination
          v-model:page="page"
          :page-count="pagination.pages"
          :page-size="pagination.limit"
        />
      </div>
    </n-spin>
  </section>
</template>
