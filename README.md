# Tests Frontend

A Vue 3 + Vite + TypeScript + Tailwind CSS v4 + Vue Router SPA skeleton, built
around the **Composition API** with `<script setup>`.

## Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite 6](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [Vue Router 4](https://router.vuejs.org/) (lazy-loaded routes)

## Project structure

```
src/
  assets/            # static assets (images, fonts)
  components/        # reusable presentational components
  composables/       # reusable Composition API hooks (use*)
  layouts/           # route layout shells
  router/            # vue-router setup and route definitions
  views/             # route-level "page" components
  App.vue            # root component
  main.ts            # app bootstrap
  style.css          # tailwind + global styles
```

## Scripts

```bash
npm install      # install dependencies
npm run dev      # start dev server on :5173
npm run build    # type-check + production build
npm run preview  # preview production build
npm run type-check
```

## Conventions

- **Composition API only** for new components (`<script setup lang="ts">`).
  See `.cursor/rules/vue-composition-api.mdc` for the enforced rule.
- Extract reusable stateful logic into `src/composables/useX.ts`.
- Use the `@/` alias for imports from `src/`.
