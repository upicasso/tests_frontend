<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError, formatValidationErrors } from '@/api/client'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const message = useMessage()

const email = ref('')
const password = ref('')
const fieldErrors = ref<Record<string, string>>({})

async function onSubmit() {
  fieldErrors.value = {}
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    message.success('Signed in.')
    const redirect = (route.query.redirect as string) || '/'
    await router.replace(redirect)
  } catch (e) {
    if (e instanceof ApiError) {
      const validation = formatValidationErrors(e.body)
      if (Object.keys(validation).length) {
        for (const [key, msgs] of Object.entries(validation)) {
          fieldErrors.value[key] = msgs[0] ?? ''
        }
      } else {
        message.error(e.message)
      }
    } else {
      message.error('Sign in failed.')
    }
  }
}
</script>

<template>
  <n-card title="Sign in">
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="Email" :feedback="fieldErrors.email">
        <n-input v-model:value="email" type="text" placeholder="alice@demo.local" />
      </n-form-item>
      <n-form-item label="Password" :feedback="fieldErrors.password">
        <n-input v-model:value="password" type="password" show-password-on="click" />
      </n-form-item>
      <n-space vertical class="w-full">
        <n-button type="primary" attr-type="submit" block :loading="auth.loading.value">
          Sign in
        </n-button>
        <n-text depth="3" class="text-center text-sm">
          Demo: alice@demo.local / password123
        </n-text>
        <n-text class="text-center text-sm">
          No account?
          <RouterLink
            :to="{ name: 'register', query: route.query }"
            class="text-brand-600 hover:underline"
          >
            Register
          </RouterLink>
        </n-text>
      </n-space>
    </n-form>
  </n-card>
</template>
