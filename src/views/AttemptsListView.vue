<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchTests } from '@/api/tests'
import { fetchUserTestAttempts, finishUserTestAttempt } from '@/api/userTestAttempts'
import { ApiError } from '@/api/client'
import type {
  PaginationMeta,
  TestAttemptStatus,
  UserTestAttemptResource,
} from '@/types/api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const finishingId = ref<number | null>(null)

const attempts = ref<UserTestAttemptResource[]>([])
const pagination = ref<PaginationMeta | null>(null)
const testNames = ref<Record<number, string>>({})
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const statusFilter = ref<TestAttemptStatus | undefined>(undefined)
const testIdFilter = ref<number | null>(null)

const statusOptions = [
  { label: 'All statuses', value: undefined as TestAttemptStatus | undefined },
  { label: 'Started', value: 'started' as const },
  { label: 'Finished', value: 'finished' as const },
]

function testLabel(testId: number): string {
  return testNames.value[testId] ?? `Test #${testId}`
}

async function loadTestNames() {
  try {
    const { data } = await fetchTests({ limit: 100 })
    const map: Record<number, string> = {}
    for (const t of data) {
      map[Number(t.id)] = t.attributes.name
    }
    testNames.value = map
  } catch {
    /* names are optional */
  }
}

async function loadAttempts() {
  loading.value = true
  try {
    const response = await fetchUserTestAttempts({
      page: page.value,
      limit: limit.value,
      status: statusFilter.value ?? undefined,
      testId: testIdFilter.value ?? undefined,
    })
    attempts.value = response.data
    pagination.value = response.meta.pagination
  } catch (e) {
    message.error(e instanceof ApiError ? e.message : 'Failed to load attempts.')
  } finally {
    loading.value = false
  }
}

function continueAttempt(row: UserTestAttemptResource) {
  router.push({
    name: 'test-take',
    params: { testId: String(row.attributes.testId) },
    query: { attemptId: row.id },
  })
}

function confirmFinishAttempt(row: UserTestAttemptResource) {
  const attemptId = Number(row.id)
  dialog.warning({
    title: 'Finish this attempt?',
    content:
      'You will not be able to submit more answers. Finish it before starting another test.',
    positiveText: 'Finish attempt',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      finishingId.value = attemptId
      try {
        await finishUserTestAttempt(attemptId)
        message.success(`Attempt #${attemptId} finished.`)
        await loadAttempts()
      } catch (e) {
        message.error(e instanceof ApiError ? e.message : 'Could not finish attempt.')
      } finally {
        finishingId.value = null
      }
      return true
    },
  })
}

function applyFilters() {
  page.value = 1
  loadAttempts()
}

onMounted(async () => {
  await loadTestNames()
  await loadAttempts()
})

watch(page, loadAttempts)
</script>

<template>
  <section class="mx-auto max-w-5xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">My attempts</h1>
      <p class="mt-2 text-slate-600">
        Your test sessions. Only one attempt can be in progress at a time — finish the current
        one before starting another test.
      </p>
    </div>

    <n-card class="mb-6">
      <n-space align="center" :wrap="true">
        <n-select
          v-model:value="statusFilter"
          :options="statusOptions"
          placeholder="Status"
          clearable
          class="min-w-40"
        />
        <n-input-number
          v-model:value="testIdFilter"
          placeholder="Test ID"
          :min="1"
          clearable
          class="w-32"
        />
        <n-button type="primary" :loading="loading" @click="applyFilters">Apply</n-button>
        <n-button @click="router.push({ name: 'tests' })">Browse tests</n-button>
      </n-space>
    </n-card>

    <n-spin :show="loading">
      <n-empty
        v-if="!loading && attempts.length === 0"
        description="No attempts yet. Start a test from the catalog."
      />
      <n-space v-else vertical size="medium">
        <n-card v-for="row in attempts" :key="row.id">
          <n-space justify="space-between" align="center" :wrap="true">
            <n-space vertical :size="4">
              <n-text strong>Attempt #{{ row.id }}</n-text>
              <n-text>{{ testLabel(row.attributes.testId) }}</n-text>
              <n-text depth="3" class="text-sm">
                Started {{ new Date(row.attributes.startedAt).toLocaleString() }}
              </n-text>
            </n-space>
            <n-space align="center">
              <n-tag :type="row.attributes.status === 'started' ? 'warning' : 'default'">
                {{ row.attributes.status }}
              </n-tag>
              <n-button
                v-if="row.attributes.status === 'started'"
                type="primary"
                size="small"
                @click="continueAttempt(row)"
              >
                Continue
              </n-button>
              <n-button
                v-if="row.attributes.status === 'started'"
                type="warning"
                size="small"
                :loading="finishingId === Number(row.id)"
                @click="confirmFinishAttempt(row)"
              >
                Finish
              </n-button>
            </n-space>
          </n-space>
        </n-card>

        <div v-if="pagination && pagination.pages > 1" class="flex justify-center">
          <n-pagination
            v-model:page="page"
            :page-count="pagination.pages"
            :page-size="pagination.limit"
          />
        </div>
      </n-space>
    </n-spin>
  </section>
</template>
