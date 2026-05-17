import { apiFetch } from '@/api/client'
import type {
  CreateUserAnswerRequest,
  UserAnswerCreated,
  UserAnswersListResponse,
} from '@/types/api'

export function fetchUserAnswersForAttempt(userTestAttemptId: number) {
  return apiFetch<UserAnswersListResponse>(
    `/api/user-test-attempts/${userTestAttemptId}/user-answers`,
  )
}

export function submitUserAnswer(payload: CreateUserAnswerRequest) {
  return apiFetch<UserAnswerCreated>('/api/user-answers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
