import { apiFetch } from '@/api/client'
import type {
  GetUserTestAttemptsParams,
  StartUserTestAttemptRequest,
  UserTestAttemptCreated,
  UserTestAttemptResource,
  UserTestAttemptsListResponse,
} from '@/types/api'

function toQuery(params: GetUserTestAttemptsParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.testId != null) search.set('testId', String(params.testId))
  if (params.status) search.set('status', params.status)
  if (params.startedFrom) search.set('startedFrom', params.startedFrom)
  if (params.startedTo) search.set('startedTo', params.startedTo)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function fetchUserTestAttempts(params: GetUserTestAttemptsParams = {}) {
  return apiFetch<UserTestAttemptsListResponse>(`/api/user-test-attempts${toQuery(params)}`)
}

export function startUserTestAttempt(payload: StartUserTestAttemptRequest) {
  return apiFetch<UserTestAttemptCreated>('/api/user-test-attempts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function finishUserTestAttempt(userTestAttemptId: number) {
  return apiFetch<UserTestAttemptCreated>(
    `/api/user-test-attempts/${userTestAttemptId}/finish`,
    { method: 'POST' },
  )
}

export function attemptResourceToCreated(
  resource: UserTestAttemptResource,
  userId = 0,
): UserTestAttemptCreated {
  return {
    id: Number(resource.id),
    testId: resource.attributes.testId,
    userId,
    status: resource.attributes.status,
    startedAt: resource.attributes.startedAt,
  }
}

/** First in-progress attempt for the user (any test). */
export async function fetchActiveAttempt() {
  const { data } = await fetchUserTestAttempts({ status: 'started', limit: 1, page: 1 })
  return data[0] ?? null
}

/** In-progress attempt for a specific test, if any. */
export async function fetchActiveAttemptForTest(testId: number) {
  const { data } = await fetchUserTestAttempts({
    testId,
    status: 'started',
    limit: 1,
    page: 1,
  })
  return data[0] ?? null
}
