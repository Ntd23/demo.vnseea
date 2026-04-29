<template>
  <div class="mx-auto w-full max-w-[720px]">
    <section class="flex flex-col gap-2">
      <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">{{ $t('pages.forgotPasswordPage.eyebrow') }}</p>
      <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">{{ $t('pages.forgotPasswordPage.title') }}</h1>
      <p class="max-w-[38rem] text-[1rem] leading-7 text-slate-500">{{ $t('pages.forgotPasswordPage.subtitle') }}</p>
    </section>

    <UForm
      :state="form"
      :validate="validateForm"
      class="mt-8 flex flex-col gap-5"
      @submit="handleReset"
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
        name="emailOrPhone"
        :label="$t('pages.forgotPasswordPage.emailLabel')"
        required
        size="xl"
        class="space-y-2"
      >
        <UInput
          v-model="form.emailOrPhone"
          autocomplete="username"
          size="xl"
          color="primary"
          :placeholder="$t('pages.forgotPasswordPage.emailPlaceholder')"
          class="w-full"
          :ui="inputUi"
        />
      </UFormField>

      <UFormField
        name="captchaConfirmed"
        size="xl"
        class="space-y-2"
      >
        <div class="flex items-center justify-between gap-4 rounded-[1.45rem] border border-[#d5e4f0] bg-white px-4 py-4 shadow-sm transition focus-within:border-[#0000ff] focus-within:shadow-[0_0_0_4px_rgba(0,0,255,0.08)]">
          <UCheckbox
            v-model="form.captchaConfirmed"
            name="captchaConfirmed"
            size="xl"
            color="primary"
            :label="$t('pages.forgotPasswordPage.captchaLabel')"
            :ui="captchaCheckboxUi"
          />

          <div class="flex shrink-0 flex-col items-center justify-center text-[10px] leading-none text-slate-500">
            <div class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#d7e3ef] bg-[#f7fbff]">
              <Icon name="i-ph-shield-check-fill" class="h-4.5 w-4.5 text-[#0000ff]" />
            </div>
            <span class="mt-1">{{ $t('pages.forgotPasswordPage.captchaBrand') }}</span>
          </div>
        </div>
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

      <p class="pt-1 text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">
        {{ $t('pages.forgotPasswordPage.readyQuestion') }}
        <NuxtLink :to="appRoutes.welcome" class="font-extrabold text-[#0000ff]">{{ $t('pages.forgotPasswordPage.login') }}</NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

type ForgotPasswordFormState = {
  emailOrPhone: string
  captchaConfirmed: boolean
}

type ForgotPasswordFormError = {
  name?: keyof ForgotPasswordFormState
  message: string
}

const form = reactive<ForgotPasswordFormState>({
  emailOrPhone: '',
  captchaConfirmed: false,
})

const inputUi = {
  base: 'h-[3.85rem] rounded-[1.45rem] px-5 text-[1rem]',
}

const captchaCheckboxUi = {
  root: 'flex-1 items-center gap-3',
  wrapper: 'flex-1 text-[1rem]',
  label: 'text-[0.98rem] font-medium text-slate-700',
  base: 'size-5 rounded-[6px] ring-[#cbd9ea] bg-white data-[state=checked]:ring-[#0000ff]',
}

const submitState = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const { t } = useI18n()

const hasValidIdentity = (value: string) => {
  const normalized = value.trim()

  if (!normalized) {
    return false
  }

  if (normalized.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  }

  return normalized.replace(/\D/g, '').length >= 8
}

const validateForm = (state: ForgotPasswordFormState): ForgotPasswordFormError[] => {
  const errors: ForgotPasswordFormError[] = []

  if (!state.emailOrPhone.trim()) {
    errors.push({
      name: 'emailOrPhone',
      message: t('pages.forgotPasswordPage.validationEmailRequired'),
    })
  }
  else if (!hasValidIdentity(state.emailOrPhone)) {
    errors.push({
      name: 'emailOrPhone',
      message: t('pages.forgotPasswordPage.validationEmailInvalid'),
    })
  }

  if (!state.captchaConfirmed) {
    errors.push({
      name: 'captchaConfirmed',
      message: t('pages.forgotPasswordPage.validationCaptchaRequired'),
    })
  }

  return errors
}

const isSubmitDisabled = computed(() =>
  submitState.value === 'loading'
  || !form.emailOrPhone.trim()
  || !form.captchaConfirmed,
)

const submitLabel = computed(() =>
  submitState.value === 'loading'
    ? t('pages.forgotPasswordPage.submitting')
    : t('pages.forgotPasswordPage.submit'),
)

const statusAlert = computed(() => {
  if (submitState.value === 'success') {
    return {
      color: 'success' as const,
      icon: 'i-ph-check-circle-fill',
      title: t('pages.forgotPasswordPage.statusSuccessTitle'),
      description: t('pages.forgotPasswordPage.statusSuccessDescription'),
    }
  }

  if (submitState.value === 'error') {
    return {
      color: 'error' as const,
      icon: 'i-ph-warning-circle-fill',
      title: t('pages.forgotPasswordPage.statusErrorTitle'),
      description: t('pages.forgotPasswordPage.statusErrorDescription'),
    }
  }

  return null
})

const handleReset = async () => {
  submitState.value = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  submitState.value = 'success'
}

const handleFormError = () => {
  submitState.value = 'error'
}

watch(() => [form.emailOrPhone, form.captchaConfirmed], () => {
  if (submitState.value !== 'loading') {
    submitState.value = 'idle'
  }
})
</script>
