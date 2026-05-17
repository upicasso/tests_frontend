<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAnswers, fetchQuestions, fetchTests, toAnswerOptions } from '@/api/tests'
import { fetchUserAnswersForAttempt, submitUserAnswer } from '@/api/userAnswers'
import { ApiError } from '@/api/client'
import { useTestSession } from '@/composables/useTestSession'
import type { AnswerOption, QuestionResource, UserAnswerCreated } from '@/types/api'

interface TestRouteState {
  testName?: string
  testDescription?: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const testId = computed(() => Number(route.params.testId))
const attemptIdFromRoute = computed(() => {
  const raw = route.query.attemptId
  const id = typeof raw === 'string' ? Number(raw) : NaN
  return Number.isFinite(id) && id > 0 ? id : undefined
})
const routeState = history.state as TestRouteState | null
const session = useTestSession(testId)

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
const answeredCount = computed(() => answeredIds.value.size)
const canSubmit = computed(
  () =>
    session.isActive.value &&
    selectedAnswerId.value != null &&
    !(isAnswered.value && lastResult.value != null),
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

async function loadAnsweredQuestions() {
  const id = session.attemptId.value
  if (id == null) return
  try {
    const { data } = await fetchUserAnswersForAttempt(id)
    answeredIds.value = new Set(data.map((a) => a.attributes.questionId))
  } catch {
    /* non-fatal */
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
  const attemptId = session.attemptId.value
  if (attemptId == null) {
    message.error('No active test attempt.')
    return
  }

  submitting.value = true
  try {
    const result = await submitUserAnswer({
      userTestAttemptId: attemptId,
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

function confirmFinishAttempt() {
  dialog.warning({
    title: 'Finish this attempt?',
    content:
      'You will not be able to submit more answers. Finish it before starting another test.',
    positiveText: 'Finish attempt',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      const ok = await session.finish()
      if (ok) {
        message.success('Attempt finished.')
        await router.push({ name: 'attempts' })
      } else if (session.finishError.value) {
        message.error(session.finishError.value)
      }
      return ok
    },
  })
}

function goPrev() {
  if (currentIndex.value > 0) currentIndex.value -= 1
}

function goNext() {
  if (currentIndex.value < questions.value.length - 1) currentIndex.value += 1
}

function goToBlockedAttempt() {
  const blocked = session.blockedByAttempt.value
  if (!blocked) return
  router.push({
    name: 'test-take',
    params: { testId: String(blocked.testId) },
    query: { attemptId: String(blocked.id) },
  })
}

async function initTest() {
  if (!Number.isFinite(testId.value) || testId.value < 1) {
    router.replace({ name: 'tests' })
    return
  }

  await resolveTestMeta()

  const ok = await session.ensure(attemptIdFromRoute.value)
  if (!ok) {
    if (session.blockedByAttempt.value) {
      message.warning(session.startError.value ?? 'Finish your current attempt first.')
    } else {
      message.error(session.startError.value ?? 'Could not start test.')
      router.push({ name: 'tests' })
    }
    return
  }

  await loadQuestions()
  await loadAnsweredQuestions()
}

onMounted(initTest)

watch(currentQuestion, () => {
  if (currentQuestion.value && session.attempt.value) loadAnswersForCurrent()
}, { immediate: true })
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <n-space vertical size="large">
      <div>
        <n-button quaternary @click="router.push({ name: 'tests' })">← Back to tests</n-button>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {{ testName || `Test #${testId}` }}
        </h1>
        <p v-if="testDescription" class="mt-1 text-slate-600">{{ testDescription }}</p>
        <n-space v-if="session.attempt.value" class="mt-3" align="center" :size="8">
          <n-tag type="info" size="small">Attempt #{{ session.attempt.value.id }}</n-tag>
          <n-tag
            :type="session.isActive.value ? 'success' : 'default'"
            size="small"
          >
            {{ session.attempt.value.status }}
          </n-tag>
          <n-text v-if="questions.length" depth="3" class="text-sm">
            {{ answeredCount }} / {{ questions.length }} answered
          </n-text>
        </n-space>
      </div>

      <n-alert
        v-if="session.blockedByAttempt.value && session.startError.value"
        type="warning"
        title="Unfinished attempt"
      >
        <n-space vertical>
          <n-text>{{ session.startError.value }}</n-text>
          <n-button type="primary" size="small" @click="goToBlockedAttempt">
            Continue attempt #{{ session.blockedByAttempt.value?.id }}
          </n-button>
          <n-button quaternary size="small" @click="router.push({ name: 'attempts' })">
            View all attempts
          </n-button>
        </n-space>
      </n-alert>

      <n-spin v-else :show="session.starting.value || loading">
        <n-alert
          v-if="session.startError.value && !session.attempt.value"
          type="error"
          :title="session.startError.value"
        />

        <n-alert
          v-else-if="session.isFinished.value"
          type="info"
          title="This attempt is finished"
        >
          You can review questions below. Submissions are closed.
        </n-alert>

        <n-empty v-else-if="!loading && questions.length === 0" description="No questions in this test." />

        <template v-else-if="currentQuestion && session.attempt.value">
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
                :disabled="!session.isActive.value || (isAnswered && !!lastResult)"
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
              Your response was recorded for this attempt.
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
                <n-space>
                  <n-button
                    v-if="session.isActive.value"
                    type="warning"
                    :loading="session.finishing.value"
                    @click="confirmFinishAttempt"
                  >
                    Finish attempt
                  </n-button>
                  <n-button
                    v-if="session.isActive.value"
                    type="primary"
                    :loading="submitting"
                    :disabled="!canSubmit"
                    @click="submitAnswer"
                  >
                    {{ isAnswered ? 'Submitted' : 'Submit answer' }}
                  </n-button>
                </n-space>
              </n-space>
            </template>
          </n-card>
        </template>
      </n-spin>
    </n-space>
  </section>
</template>
