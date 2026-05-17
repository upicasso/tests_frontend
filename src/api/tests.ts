import { apiFetch } from '@/api/client'
import type {
  AnswerOption,
  AnswerResource,
  AnswersListResponse,
  GetTestsParams,
  QuestionsListResponse,
  TestsListResponse,
} from '@/types/api'

function toQuery(params: GetTestsParams): string {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.limit != null) search.set('limit', String(params.limit))
  if (params.name) search.set('name', params.name)
  if (params.createdFrom) search.set('createdFrom', params.createdFrom)
  if (params.createdTo) search.set('createdTo', params.createdTo)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export function fetchTests(params: GetTestsParams = {}) {
  return apiFetch<TestsListResponse>(`/api/tests${toQuery(params)}`, { auth: false })
}

export function fetchQuestions(testId: number) {
  return apiFetch<QuestionsListResponse>(`/api/tests/${testId}/questions`, { auth: false })
}

export function fetchAnswers(testId: number, questionId: number) {
  return apiFetch<AnswersListResponse>(
    `/api/tests/${testId}/questions/${questionId}/answers`,
    { auth: false },
  )
}

/** Strip `isCorrect` so the UI cannot leak answers before submission. */
export function toAnswerOptions(resources: AnswerResource[]): AnswerOption[] {
  return resources.map((a) => ({
    id: Number(a.id),
    text: a.attributes.text,
  }))
}
