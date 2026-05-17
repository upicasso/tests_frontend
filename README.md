# Interview Tests Frontend

Vue 3 SPA for browsing interview tests and submitting answers via the Symfony API at `symfony.test`.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vite 6, TypeScript, Tailwind CSS v4
- Vue Router 4, [Naive UI](https://www.naiveui.com/)

## API flow

1. `GET /api/tests` — browse tests (public)
2. `POST /api/login` / `POST /api/register` — JWT authentication
3. `GET /api/user-test-attempts` — list your attempts (filters: `testId`, `status`, dates)
4. `POST /api/user-test-attempts` — start an attempt (`{ testId }`); blocked while another is `started`
5. `POST /api/user-test-attempts/{id}/finish` — mark attempt as `finished` (required before starting another)
6. `GET /api/tests/{id}/questions` and `…/answers` — load content
7. `GET /api/user-test-attempts/{id}/user-answers` — answers already submitted for an attempt
8. `POST /api/user-answers` — submit `{ userTestAttemptId, questionId, answerId }`

OpenAPI: `http://symfony.test/api/doc.json`

## Project structure

```
src/
  api/           # HTTP client and endpoint modules
  composables/   # useAuth, useTestSession
  components/    # App shell (header, sidebar, footer)
  layouts/       # DefaultLayout, AuthLayout
  router/
  types/         # API TypeScript types
  views/         # Route pages
```

## Development

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api → symfony.test
```

Backend fixtures (in `tests_docker/app`):

```bash
php bin/console doctrine:fixtures:load
```

Demo user: `alice@demo.local` / `password123`
