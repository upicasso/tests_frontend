import { computed, ref, shallowRef, type MaybeRefOrGetter, toValue } from 'vue'
import {
  attemptResourceToCreated,
  fetchActiveAttempt,
  fetchActiveAttemptForTest,
  fetchUserTestAttempts,
  finishUserTestAttempt,
  startUserTestAttempt,
} from '@/api/userTestAttempts'
import { ApiError } from '@/api/client'
import { useAuth } from '@/composables/useAuth'
import type { UserTestAttemptCreated } from '@/types/api'

const UNFINISHED_MSG =
  'You already have an unfinished test attempt. Finish it before starting a new one.'

/**
 * Resolves or creates an active test attempt (GET list + POST /api/user-test-attempts).
 * Finishing uses POST /api/user-test-attempts/{id}/finish.
 */
export function useTestSession(testId: MaybeRefOrGetter<number>) {
  const auth = useAuth()
  const attempt = shallowRef<UserTestAttemptCreated | null>(null)
  const starting = ref(false)
  const finishing = ref(false)
  const startError = ref<string | null>(null)
  const finishError = ref<string | null>(null)
  const blockedByAttempt = shallowRef<UserTestAttemptCreated | null>(null)

  const isActive = computed(
    () => attempt.value != null && attempt.value.status === 'started',
  )

  const isFinished = computed(
    () => attempt.value != null && attempt.value.status === 'finished',
  )

  const attemptId = computed(() => attempt.value?.id ?? null)

  function setAttemptFromResource(
    resource: Parameters<typeof attemptResourceToCreated>[0],
  ): UserTestAttemptCreated {
    const created = attemptResourceToCreated(resource, auth.user.value?.id ?? 0)
    attempt.value = created
    return created
  }

  async function ensure(attemptIdFromRoute?: number): Promise<boolean> {
    const id = toValue(testId)
    if (!Number.isFinite(id) || id < 1) {
      startError.value = 'Invalid test.'
      return false
    }

    starting.value = true
    startError.value = null
    blockedByAttempt.value = null

    try {
      if (attemptIdFromRoute != null) {
        const { data } = await fetchUserTestAttempts({ testId: id, limit: 100 })
        let match = data.find((a) => Number(a.id) === attemptIdFromRoute)
        if (!match) {
          const { data: all } = await fetchUserTestAttempts({ limit: 100 })
          match = all.find((a) => Number(a.id) === attemptIdFromRoute)
        }
        if (!match) {
          startError.value = 'Test attempt not found.'
          return false
        }
        if (match.attributes.testId !== id) {
          startError.value = 'This attempt belongs to a different test.'
          return false
        }
        setAttemptFromResource(match)
        return true
      }

      const existingForTest = await fetchActiveAttemptForTest(id)
      if (existingForTest) {
        setAttemptFromResource(existingForTest)
        return true
      }

      const otherActive = await fetchActiveAttempt()
      if (otherActive) {
        blockedByAttempt.value = setAttemptFromResource(otherActive)
        startError.value = UNFINISHED_MSG
        return false
      }

      attempt.value = await startUserTestAttempt({ testId: id })
      return true
    } catch (e) {
      startError.value =
        e instanceof ApiError ? e.message : 'Could not start the test attempt.'
      attempt.value = null
      return false
    } finally {
      starting.value = false
    }
  }

  async function finish(): Promise<boolean> {
    const id = attemptId.value
    if (id == null) {
      finishError.value = 'No active attempt.'
      return false
    }

    finishing.value = true
    finishError.value = null
    try {
      attempt.value = await finishUserTestAttempt(id)
      return true
    } catch (e) {
      finishError.value =
        e instanceof ApiError ? e.message : 'Could not finish the attempt.'
      return false
    } finally {
      finishing.value = false
    }
  }

  function reset(): void {
    attempt.value = null
    startError.value = null
    finishError.value = null
    blockedByAttempt.value = null
  }

  return {
    attempt,
    attemptId,
    starting,
    finishing,
    startError,
    finishError,
    blockedByAttempt,
    isActive,
    isFinished,
    ensure,
    finish,
    reset,
  }
}
