import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'tests',
        component: () => import('@/views/TestsListView.vue'),
        meta: { title: 'Tests' },
      },
      {
        path: 'attempts',
        name: 'attempts',
        component: () => import('@/views/AttemptsListView.vue'),
        meta: { title: 'My attempts', requiresAuth: true },
      },
      {
        path: 'tests/:testId',
        name: 'test-take',
        component: () => import('@/views/TestTakeView.vue'),
        meta: { title: 'Take test', requiresAuth: true },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: 'Sign in', guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/RegisterView.vue'),
        meta: { title: 'Register', guestOnly: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuth()
  if (!auth.initialized.value) {
    await auth.init()
  }

  if (to.meta.guestOnly && auth.isAuthenticated.value) {
    return { name: 'tests' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'App'
  document.title = `${title} · Interview Tests`
})
