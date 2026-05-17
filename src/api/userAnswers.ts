import { apiFetch } from '@/api/client'
import type { CreateUserAnswerRequest, UserAnswerCreated } from '@/types/api'

export function submitUserAnswer(payload: CreateUserAnswerRequest) {
  return apiFetch<UserAnswerCreated>('/api/user-answers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
