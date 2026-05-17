<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTests } from '@/api/tests'
import {
  fetchActiveAttempt,
  fetchActiveAttemptForTest,
} from '@/api/userTestAttempts'
import { ApiError } from '@/api/client'
import { useAuth } from '@/composables/useAuth'
import type { PaginationMeta, TestResource } from '@/types/api'

const router = useRouter()
const auth = useAuth()
const message = useMessage()
const dialog = useDialog()

const tests = ref<TestResource[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(false)
const nameFilter = ref('')
const page = ref(1)
const limit = ref(10)
const activeAttemptTestId = ref<number | null>(null)

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

async function loadActiveAttemptHint() {
  if (!auth.isAuthenticated.value) {
    activeAttemptTestId.value = null
    return
  }
  try {
    const active = await fetchActiveAttempt()
    activeAttemptTestId.value = active ? active.attributes.testId : null
  } catch {
    activeAttemptTestId.value = null
  }
}

function navigateToTest(
  test: TestResource,
  query?: { attemptId: string },
) {
  router.push({
    name: 'test-take',
    params: { testId: test.id },
    query,
    state: {
      testName: test.attributes.name,
      testDescription: test.attributes.description,
    },
  })
}

async function openTest(test: TestResource) {
  const target = {
    name: 'test-take' as const,
    params: { testId: test.id },
    state: {
      testName: test.attributes.name,
      testDescription: test.attributes.description,
    },
  }

  if (!auth.isAuthenticated.value) {
    router.push({
      name: 'login',
      query: { redirect: router.resolve(target).fullPath },
    })
    return
  }

  const testIdNum = Number(test.id)
  const existingForTest = await fetchActiveAttemptForTest(testIdNum)
  if (existingForTest) {
    navigateToTest(test, { attemptId: existingForTest.id })
    return
  }

  const otherActive = await fetchActiveAttempt()
  if (otherActive && otherActive.attributes.testId !== testIdNum) {
    dialog.warning({
      title: 'Unfinished attempt',
      content:
        'You already have an unfinished test attempt. Finish it before starting a new one.',
      positiveText: `Continue attempt #${otherActive.id}`,
      negativeText: 'My attempts',
      onPositiveClick: () => {
        router.push({
          name: 'test-take',
          params: { testId: String(otherActive.attributes.testId) },
          query: { attemptId: otherActive.id },
        })
      },
      onNegativeClick: () => {
        router.push({ name: 'attempts' })
      },
    })
    return
  }

  navigateToTest(test)
}

function onSearch() {
  page.value = 1
  loadTests()
}

onMounted(async () => {
  await loadTests()
  await loadActiveAttemptHint()
})

watch(page, loadTests)
watch(() => auth.isAuthenticated.value, loadActiveAttemptHint)
</script>

<template>
  <section class="mx-auto max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Interview tests</h1>
      <p class="mt-2 text-slate-600">
        Browse tests and start an attempt. You can only have one in-progress attempt at a time.
      </p>
    </div>

    <n-alert
      v-if="activeAttemptTestId != null"
      type="warning"
      class="mb-6"
      title="You have an unfinished attempt"
    >
      <n-space align="center">
        <n-text>Continue it before starting another test.</n-text>
        <n-button
          size="small"
          type="primary"
          @click="router.push({ name: 'attempts' })"
        >
          My attempts
        </n-button>
      </n-space>
    </n-alert>

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
                {{
                  activeAttemptTestId === Number(test.id) ? 'Continue' : 'Start test'
                }}
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
