<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px]">
        <div class="mx-auto max-w-[420px]">
          <section class="flex flex-col gap-2">
            <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">{{ $t('pages.welcomePage.eyebrow') }}</p>
            <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">{{ $t('pages.welcomePage.title') }}</h1>
            <p class="text-[1rem] leading-7 text-slate-500">{{ $t('pages.welcomePage.subtitle') }}</p>
          </section>

          <UForm
            :state="form"
            :validate="validateForm"
            class="mt-7 flex flex-col gap-5"
            @submit="handleLogin"
            @error="handleFormError"
          >
            <UAlert
              v-if="statusAlert"
              :color="statusAlert.color"
              variant="subtle"
              :icon="statusAlert.icon"
              :title="statusAlert.title"
              :description="statusAlert.description"
              class="rounded-[20px]"
            />

            <UFormField
              name="login"
              :label="$t('pages.welcomePage.loginLabel')"
              :hint="$t('pages.welcomePage.loginHint')"
              required
              size="xl"
              class="space-y-2"
            >
              <UInput
                v-model="form.login"
                autocomplete="username"
                size="xl"
                color="primary"
                :placeholder="$t('pages.welcomePage.loginPlaceholder')"
                class="w-full"
                :ui="{ base: 'h-[3.85rem] rounded-[1.45rem] px-5 text-[1rem]' }"
              />
            </UFormField>

            <UFormField
              name="password"
              required
              size="xl"
              class="space-y-2"
            >
              <template #label>
                {{ $t('pages.welcomePage.passwordLabel') }}
              </template>

              <template #hint>
                <NuxtLink class="text-[0.95rem] font-bold text-[#0000ff]" to="/forgot-password">{{ $t('pages.welcomePage.forgotPassword') }}</NuxtLink>
              </template>

              <UInput
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                size="xl"
                color="primary"
                :placeholder="$t('pages.welcomePage.passwordPlaceholder')"
                class="w-full"
                :ui="{ base: 'h-[3.85rem] rounded-[1.45rem] px-5 pe-14 text-[1rem]' }"
              >
                <template #trailing>
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#eef3ff] hover:text-[#0000ff]"
                    :aria-label="showPassword ? $t('pages.welcomePage.hidePassword') : $t('pages.welcomePage.showPassword')"
                    @click="showPassword = !showPassword"
                  >
                    <Icon :name="showPassword ? 'i-ph-eye-slash-bold' : 'i-ph-eye-bold'" class="h-5 w-5" />
                  </button>
                </template>
              </UInput>
            </UFormField>

            <UButton
              type="submit"
              loading-auto
              loading-icon="i-lucide-loader-2"
              color="primary"
              variant="solid"
              block
              size="xl"
              :disabled="isSubmitDisabled"
              class="mt-1 h-[3.95rem] rounded-[1.45rem] text-[1.05rem] font-black shadow-[0_14px_32px_rgba(0,0,255,0.18)]"
            >
              {{ submitLabel }}
            </UButton>

            <p class="text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">
              {{ $t('pages.welcomePage.noAccount') }}
              <NuxtLink class="font-extrabold text-[#0000ff]" to="/register">{{ $t('pages.welcomePage.register') }}</NuxtLink>
            </p>
          </UForm>
        </div>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
type WelcomeFormState = {
  login: string
  password: string
}

type WelcomeFormError = {
  name?: keyof WelcomeFormState
  message: string
}

const form = reactive<WelcomeFormState>({
  login: '',
  password: '',
})

const showPassword = ref(false)
const submitState = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const { t } = useI18n()
const route = useRoute()
const requestURL = useRequestURL()

const canonicalUrl = computed(() => new URL(route.fullPath || '/welcome', requestURL.origin).toString())

const heroProps = computed(() => ({
  title: t('pages.welcomePage.title'),
  subtitle: t('pages.welcomePage.subtitle'),
}))

const validateForm = (state: WelcomeFormState): WelcomeFormError[] => {
  const errors: WelcomeFormError[] = []

  if (!state.login.trim()) {
    errors.push({
      name: 'login',
      message: t('pages.welcomePage.validationLoginRequired'),
    })
  }

  if (!state.password.trim()) {
    errors.push({
      name: 'password',
      message: t('pages.welcomePage.validationPasswordRequired'),
    })
  }
  else if (state.password.trim().length < 6) {
    errors.push({
      name: 'password',
      message: t('pages.welcomePage.validationPasswordLength'),
    })
  }

  return errors
}

const isSubmitDisabled = computed(() =>
  submitState.value === 'loading'
  || !form.login.trim()
  || !form.password.trim(),
)

const submitLabel = computed(() =>
  submitState.value === 'loading'
    ? t('pages.welcomePage.loggingIn')
    : t('pages.welcomePage.login'),
)

const statusAlert = computed(() => {
  if (submitState.value === 'success') {
    return {
      color: 'success' as const,
      icon: 'i-ph-check-circle-fill',
      title: t('pages.welcomePage.statusSuccessTitle'),
      description: t('pages.welcomePage.statusSuccessDescription'),
    }
  }

  if (submitState.value === 'error') {
    return {
      color: 'error' as const,
      icon: 'i-ph-warning-circle-fill',
      title: t('pages.welcomePage.statusErrorTitle'),
      description: t('pages.welcomePage.statusErrorDescription'),
    }
  }

  return null
})

const handleLogin = async () => {
  submitState.value = 'loading'
  await new Promise(r => setTimeout(r, 500))
  submitState.value = 'success'
}

const handleFormError = () => {
  submitState.value = 'error'
}

watch(() => [form.login, form.password], () => {
  if (submitState.value !== 'loading') {
    submitState.value = 'idle'
  }
})

useSeoMeta({
  title: () => t('pages.welcomePage.seoTitle'),
  description: () => t('pages.welcomePage.seoDescription'),
  ogTitle: () => t('pages.welcomePage.seoTitle'),
  ogDescription: () => t('pages.welcomePage.seoDescription'),
  ogUrl: () => canonicalUrl.value,
  robots: 'noindex, nofollow',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})
</script>
