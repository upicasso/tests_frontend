<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAnswers, fetchQuestions, fetchTests, toAnswerOptions } from '@/api/tests'
import { submitUserAnswer } from '@/api/userAnswers'
import { ApiError } from '@/api/client'
import { useAuth } from '@/composables/useAuth'
import type { AnswerOption, QuestionResource, UserAnswerCreated } from '@/types/api'

interface TestRouteState {
  testName?: string
  testDescription?: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const auth = useAuth()

const testId = computed(() => Number(route.params.testId))
const routeState = history.state as TestRouteState | null

const testName = ref(routeState?.testName ?? '')
const testDescription = ref(routeState?.testDescription ?? '')
const questions = ref<QuestionResource[]>([])
const currentIndex = ref(0)
const answers = ref<AnswerOption[]>([])
const selectedAnswerId = ref<number | null>(null)
const lastResult = ref<UserAnswerCreated | null>(null)
const answeredIds = ref<Set<number>>(new Set())
const loading = ref(false)
const loadingAnswers = ref(false)
const submitting = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
const currentQuestionId = computed(() =>
  currentQuestion.value ? Number(currentQuestion.value.id) : null,
)
const isAnswered = computed(() =>
  currentQuestionId.value != null ? answeredIds.value.has(currentQuestionId.value) : false,
)
const progressLabel = computed(() =>
  questions.value.length
    ? `Question ${currentIndex.value + 1} of ${questions.value.length}`
    : '',
)

async function resolveTestMeta() {
  if (testName.value) return
  try {
    const { data } = await fetchTests({ limit: 100 })
    const match = data.find((t) => t.id === String(testId.value))
    if (match) {
      testName.value = match.attributes.name
      testDescription.value = match.attributes.description
    }
  } catch {
    /* optional metadata */
  }
}

async function loadQuestions() {
  loading.value = true
  try {
    const { data } = await fetchQuestions(testId.value)
    questions.value = data
    if (data.length === 0) {
      message.warning('This test has no questions yet.')
    }
  } catch (e) {
    message.error(e instanceof ApiError ? e.message : 'Failed to load questions.')
    router.push({ name: 'tests' })
  } finally {
    loading.value = false
  }
}

async function loadAnswersForCurrent() {
  const q = currentQuestion.value
  if (!q) return
  loadingAnswers.value = true
  selectedAnswerId.value = null
  lastResult.value = null
  try {
    const { data } = await fetchAnswers(testId.value, Number(q.id))
    answers.value = toAnswerOptions(data)
  } catch (e) {
    message.error(e instanceof ApiError ? e.message : 'Failed to load answers.')
    answers.value = []
  } finally {
    loadingAnswers.value = false
  }
}

async function submitAnswer() {
  if (!currentQuestionId.value || selectedAnswerId.value == null) {
    message.warning('Select an answer first.')
    return
  }
  if (!auth.isAuthenticated.value) {
    message.info('Sign in to submit your answer.')
    router.push({
      name: 'login',
      query: { redirect: route.fullPath },
    })
    return
  }
  submitting.value = true
  try {
    const result = await submitUserAnswer({
      questionId: currentQuestionId.value,
      answerId: selectedAnswerId.value,
    })
    lastResult.value = result
    answeredIds.value = new Set([...answeredIds.value, currentQuestionId.value])
    if (result.isCorrect) {
      message.success('Correct!')
    } else {
      message.error('Incorrect.')
    }
  } catch (e) {
    message.error(e instanceof ApiError ? e.message : 'Failed to submit answer.')
  } finally {
    submitting.value = false
  }
}

function goPrev() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

function goNext() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value += 1
}

onMounted(async () => {
  if (!Number.isFinite(testId.value) || testId.value < 1) {
    router.replace({ name: 'tests' })
    return
  }
  await resolveTestMeta()
  await loadQuestions()
})

watch(currentQuestion, () => {
  if (currentQuestion.value) loadAnswersForCurrent()
}, { immediate: true })
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <n-space vertical size="large">
      <div>
        <n-button quaternary tag="a" @click="router.push({ name: 'tests' })">
          ← Back to tests
        </n-button>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {{ testName || `Test #${testId}` }}
        </h1>
        <p v-if="testDescription" class="mt-1 text-slate-600">{{ testDescription }}</p>
      </div>

      <n-spin :show="loading">
        <n-empty v-if="!loading && questions.length === 0" description="No questions in this test." />

        <template v-else-if="currentQuestion">
          <n-card>
            <template #header>
              <n-space justify="space-between" align="center">
                <span class="font-medium text-slate-700">{{ progressLabel }}</span>
                <n-tag v-if="isAnswered" type="success" size="small">Submitted</n-tag>
              </n-space>
            </template>

            <p class="text-lg text-slate-900">{{ currentQuestion.attributes.text }}</p>

            <n-spin :show="loadingAnswers" class="mt-6">
              <n-radio-group
                v-model:value="selectedAnswerId"
                class="w-full"
                :disabled="isAnswered && !!lastResult"
              >
                <n-space vertical size="medium" class="w-full">
                  <n-radio
                    v-for="option in answers"
                    :key="option.id"
                    :value="option.id"
                    class="w-full rounded-lg border border-slate-200 px-4 py-3"
                  >
                    {{ option.text }}
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-spin>

            <n-alert
              v-if="lastResult"
              class="mt-4"
              :type="lastResult.isCorrect ? 'success' : 'error'"
              :title="lastResult.isCorrect ? 'Correct answer' : 'Wrong answer'"
            >
              Your response was recorded.
            </n-alert>

            <template #footer>
              <n-space justify="space-between" :wrap="true">
                <n-space>
                  <n-button :disabled="currentIndex === 0" @click="goPrev">Previous</n-button>
                  <n-button
                    :disabled="currentIndex >= questions.length - 1"
                    @click="goNext"
                  >
                    Next
                  </n-button>
                </n-space>
                <n-button
                  type="primary"
                  :loading="submitting"
                  :disabled="selectedAnswerId == null || (isAnswered && !!lastResult)"
                  @click="submitAnswer"
                >
                  {{ isAnswered ? 'Submitted' : 'Submit answer' }}
                </n-button>
              </n-space>
            </template>
          </n-card>

          <n-text v-if="!auth.isAuthenticated" depth="3" class="text-sm">
            You can browse questions without signing in. Sign in to submit answers.
          </n-text>
        </template>
      </n-spin>
    </n-space>
  </section>
</template>
