<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError, formatValidationErrors } from '@/api/client'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const message = useMessage()

const firstName = ref('')
const lastName = ref('')
const dateOfBirth = ref<number | null>(null)
const email = ref('')
const password = ref('')
const picture = ref('')
const fieldErrors = ref<Record<string, string>>({})

function formatDate(ts: number | null): string {
  if (ts == null) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function onSubmit() {
  fieldErrors.value = {}
  if (!dateOfBirth.value) {
    fieldErrors.value.dateOfBirth = 'Date of birth is required.'
    return
  }
  try {
    await auth.register({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      dateOfBirth: formatDate(dateOfBirth.value),
      email: email.value.trim(),
      password: password.value,
      picture: picture.value.trim() || null,
    })
    message.success('Account created.')
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
      message.error('Registration failed.')
    }
  }
}
</script>

<template>
  <n-card title="Create account">
    <n-form @submit.prevent="onSubmit">
      <n-form-item label="First name" :feedback="fieldErrors.firstName">
        <n-input v-model:value="firstName" />
      </n-form-item>
      <n-form-item label="Last name" :feedback="fieldErrors.lastName">
        <n-input v-model:value="lastName" />
      </n-form-item>
      <n-form-item label="Date of birth" :feedback="fieldErrors.dateOfBirth">
        <n-date-picker v-model:value="dateOfBirth" type="date" class="w-full" />
      </n-form-item>
      <n-form-item label="Email" :feedback="fieldErrors.email">
        <n-input v-model:value="email" type="text" />
      </n-form-item>
      <n-form-item label="Password" :feedback="fieldErrors.password">
        <n-input v-model:value="password" type="password" show-password-on="click" />
      </n-form-item>
      <n-form-item label="Picture URL (optional)" :feedback="fieldErrors.picture">
        <n-input v-model:value="picture" placeholder="https://…" />
      </n-form-item>
      <n-space vertical class="w-full">
        <n-button type="primary" attr-type="submit" block :loading="auth.loading.value">
          Register
        </n-button>
        <n-text class="text-center text-sm">
          Already have an account?
          <RouterLink
            :to="{ name: 'login', query: route.query }"
            class="text-brand-600 hover:underline"
          >
            Sign in
          </RouterLink>
        </n-text>
      </n-space>
    </n-form>
  </n-card>
</template>
