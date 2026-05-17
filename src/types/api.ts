/** JSON:API-style resource envelopes from the Symfony API */

export interface JsonApiResource<TType extends string, TAttrs> {
  type: TType
  id: string
  attributes: TAttrs
}

export interface TestAttributes {
  name: string
  description: string
  createdAt: string
}

export interface QuestionAttributes {
  text: string
}

export interface AnswerAttributes {
  text: string
  isCorrect: boolean
}

export type TestResource = JsonApiResource<'tests', TestAttributes>
export type QuestionResource = JsonApiResource<'questions', QuestionAttributes>
export type AnswerResource = JsonApiResource<'answers', AnswerAttributes>

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface TestsListResponse {
  data: TestResource[]
  meta: { pagination: PaginationMeta }
}

export interface QuestionsListResponse {
  data: QuestionResource[]
}

export interface AnswersListResponse {
  data: AnswerResource[]
}

export interface JwtTokenResponse {
  token: string
}

export interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  picture?: string | null
  roles: string[]
}

export interface UserRegistered {
  id: number
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  picture?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterUserRequest {
  firstName: string
  lastName: string
  dateOfBirth: string
  email: string
  password: string
  picture?: string | null
}

export type TestAttemptStatus = 'started' | 'finished'

export interface UserTestAttemptAttributes {
  testId: number
  status: TestAttemptStatus
  startedAt: string
}

export type UserTestAttemptResource = JsonApiResource<
  'user-test-attempts',
  UserTestAttemptAttributes
>

export interface UserTestAttemptsListResponse {
  data: UserTestAttemptResource[]
  meta: { pagination: PaginationMeta }
}

export interface GetUserTestAttemptsParams {
  page?: number
  limit?: number
  testId?: number
  status?: TestAttemptStatus
  startedFrom?: string
  startedTo?: string
}

export interface StartUserTestAttemptRequest {
  testId: number
}

export interface UserTestAttemptCreated {
  id: number
  testId: number
  userId: number
  status: TestAttemptStatus
  startedAt: string
}

export interface UserAnswerAttributes {
  questionId: number
  answerId: number
  isCorrect: boolean
  createdAt: string
}

export type UserAnswerResource = JsonApiResource<'user-answers', UserAnswerAttributes>

export interface UserAnswersListResponse {
  data: UserAnswerResource[]
}

export interface CreateUserAnswerRequest {
  userTestAttemptId: number
  questionId: number
  answerId: number
}

export interface UserAnswerCreated {
  id: number
  userTestAttemptId: number
  questionId: number
  answerId: number
  isCorrect: boolean
  createdAt: string
}

export interface ErrorMessage {
  error?: string
  message?: string
  code?: number
}

export interface ValidationErrors {
  errors: Record<string, string[]>
}

export interface GetTestsParams {
  page?: number
  limit?: number
  name?: string
  createdFrom?: string
  createdTo?: string
}

/** Answer option shown in the UI (`isCorrect` stripped before display). */
export interface AnswerOption {
  id: number
  text: string
}
