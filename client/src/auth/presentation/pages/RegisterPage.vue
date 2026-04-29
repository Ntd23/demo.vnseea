<template>
  <div class="mx-auto w-full max-w-[720px]">
    <section class="flex flex-col gap-2">
      <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">{{ $t('pages.registerPage.eyebrow') }}</p>
      <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">{{ $t('pages.registerPage.title') }}</h1>
      <p class="max-w-[38rem] text-[1rem] leading-7 text-slate-500">{{ $t('pages.registerPage.subtitle') }}</p>
    </section>

    <UForm
      :state="form"
      :validate="validateForm"
      class="mt-8 flex flex-col gap-5"
      @submit="handleRegister"
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

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField
          name="firstName"
          :label="$t('pages.registerPage.firstName')"
          required
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="form.firstName"
            autocomplete="given-name"
            size="xl"
            color="primary"
            :placeholder="$t('pages.registerPage.firstNamePlaceholder')"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>

        <UFormField
          name="lastName"
          :label="$t('pages.registerPage.lastName')"
          required
          size="xl"
          class="space-y-2"
        >
          <UInput
            v-model="form.lastName"
            autocomplete="family-name"
            size="xl"
            color="primary"
            :placeholder="$t('pages.registerPage.lastNamePlaceholder')"
            class="w-full"
            :ui="inputUi"
          />
        </UFormField>
      </div>

      <UFormField
        name="emailOrPhone"
        :label="$t('pages.registerPage.emailOrPhone')"
        required
        size="xl"
        class="space-y-2"
      >
        <UInput
          v-model="form.emailOrPhone"
          autocomplete="username"
          size="xl"
          color="primary"
          :placeholder="$t('pages.registerPage.emailOrPhonePlaceholder')"
          class="w-full"
          :ui="inputUi"
        />
      </UFormField>

      <UFormField
        name="password"
        :label="$t('pages.registerPage.newPassword')"
        required
        size="xl"
        class="space-y-2"
      >
        <UInput
          v-model="form.password"
          name="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          size="xl"
          color="primary"
          :placeholder="$t('pages.registerPage.newPasswordPlaceholder')"
          class="w-full"
          :ui="passwordInputUi"
        >
          <template #trailing>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-[#eef3ff] hover:text-[#0000ff]"
              :aria-label="showPassword ? $t('pages.registerPage.hidePassword') : $t('pages.registerPage.showPassword')"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'i-ph-eye-slash-bold' : 'i-ph-eye-bold'" class="h-5 w-5" />
            </button>
          </template>
        </UInput>
      </UFormField>

      <div class="space-y-2">
        <p class="text-[0.95rem] font-medium text-slate-700">
          {{ $t('pages.registerPage.birthday') }}
        </p>

        <div class="grid gap-3 md:grid-cols-3">
          <UFormField name="birthdayDay" class="space-y-2">
            <USelect
              v-model="form.birthdayDay"
              :items="dayOptions"
              value-key="value"
              label-key="label"
              size="xl"
              color="primary"
              :placeholder="$t('pages.registerPage.day')"
              :aria-label="$t('pages.registerPage.day')"
              class="w-full"
              :ui="selectUi"
            />
          </UFormField>

          <UFormField name="birthdayMonth" class="space-y-2">
            <USelect
              v-model="form.birthdayMonth"
              :items="monthOptions"
              value-key="value"
              label-key="label"
              size="xl"
              color="primary"
              :placeholder="$t('pages.registerPage.month')"
              :aria-label="$t('pages.registerPage.month')"
              class="w-full"
              :ui="selectUi"
            />
          </UFormField>

          <UFormField name="birthdayYear" class="space-y-2">
            <USelect
              v-model="form.birthdayYear"
              :items="yearOptions"
              value-key="value"
              label-key="label"
              size="xl"
              color="primary"
              :placeholder="$t('pages.registerPage.year')"
              :aria-label="$t('pages.registerPage.year')"
              class="w-full"
              :ui="selectUi"
            />
          </UFormField>
        </div>
      </div>

      <UFormField
        name="gender"
        :label="$t('pages.registerPage.gender')"
        required
        size="xl"
        class="space-y-3"
      >
        <URadioGroup
          v-model="form.gender"
          :items="genderOptions"
          value-key="value"
          label-key="label"
          color="primary"
          variant="card"
          indicator="end"
          size="xl"
          :ui="radioGroupUi"
        />
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
        {{ $t('pages.registerPage.hasAccount') }}
        <NuxtLink class="font-extrabold text-[#0000ff]" :to="appRoutes.welcome">{{ $t('pages.registerPage.login') }}</NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { appRoutes } from "#shared-kernel/application/constants/route-registry"

type RegisterGender = 'female' | 'male' | 'custom'

type RegisterFormState = {
  firstName: string
  lastName: string
  emailOrPhone: string
  password: string
  birthdayDay?: string
  birthdayMonth?: string
  birthdayYear?: string
  gender?: RegisterGender
}

type RegisterFormError = {
  name?: keyof RegisterFormState
  message: string
}

const form = reactive<RegisterFormState>({
  firstName: '',
  lastName: '',
  emailOrPhone: '',
  password: '',
  birthdayDay: undefined,
  birthdayMonth: undefined,
  birthdayYear: undefined,
  gender: undefined,
})

const inputUi = {
  base: 'h-[3.85rem] rounded-[1.45rem] px-5 text-[1rem]',
}

const passwordInputUi = {
  base: 'h-[3.85rem] rounded-[1.45rem] px-5 pe-14 text-[1rem]',
}

const selectUi = {
  base: 'h-[3.85rem] rounded-[1.45rem] px-5 text-[1rem]',
}

const radioGroupUi = {
  fieldset: 'grid grid-cols-1 gap-3 md:grid-cols-3',
  item: 'min-h-[4.85rem] items-center rounded-[1.45rem] border px-4 py-4 transition hover:border-[#c8d9ef]',
  container: 'h-full',
  wrapper: 'flex-1',
  label: 'text-[1rem] font-semibold text-slate-700',
  base: 'size-5 ring-[#cbd9ea] bg-white data-[state=checked]:ring-[#0000ff]',
}

const showPassword = ref(false)
const submitState = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const { t } = useI18n()
const currentYear = new Date().getFullYear()

const dayOptions = computed(() =>
  Array.from({ length: 31 }, (_, index) => {
    const value = String(index + 1)

    return {
      label: value,
      value,
    }
  }),
)

const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1)

    return {
      label: t('pages.registerPage.monthShort', { month: index + 1 }),
      value,
    }
  }),
)

const yearOptions = computed(() =>
  Array.from({ length: 100 }, (_, index) => {
    const year = String(currentYear - index)

    return {
      label: year,
      value: year,
    }
  }),
)

const genderOptions = computed(() => {
  const selectedClass = 'border-[#0000ff] bg-[#eef3ff] shadow-[0_10px_20px_rgba(0,0,255,0.08)]'
  const defaultClass = 'border-[#d5e4f0] bg-white shadow-sm'

  return [
    {
      label: t('pages.registerPage.female'),
      value: 'female',
      class: form.gender === 'female' ? selectedClass : defaultClass,
    },
    {
      label: t('pages.registerPage.male'),
      value: 'male',
      class: form.gender === 'male' ? selectedClass : defaultClass,
    },
    {
      label: t('pages.registerPage.custom'),
      value: 'custom',
      class: form.gender === 'custom' ? selectedClass : defaultClass,
    },
  ] satisfies Array<{ label: string, value: RegisterGender, class: string }>
})

const validateForm = (state: RegisterFormState): RegisterFormError[] => {
  const errors: RegisterFormError[] = []

  if (!state.firstName.trim()) {
    errors.push({
      name: 'firstName',
      message: t('pages.registerPage.validationFirstNameRequired'),
    })
  }

  if (!state.lastName.trim()) {
    errors.push({
      name: 'lastName',
      message: t('pages.registerPage.validationLastNameRequired'),
    })
  }

  if (!state.emailOrPhone.trim()) {
    errors.push({
      name: 'emailOrPhone',
      message: t('pages.registerPage.validationEmailOrPhoneRequired'),
    })
  }

  if (!state.password.trim()) {
    errors.push({
      name: 'password',
      message: t('pages.registerPage.validationPasswordRequired'),
    })
  }
  else if (state.password.trim().length < 6) {
    errors.push({
      name: 'password',
      message: t('pages.registerPage.validationPasswordLength'),
    })
  }

  if (!state.birthdayDay) {
    errors.push({
      name: 'birthdayDay',
      message: t('pages.registerPage.validationBirthdayRequired'),
    })
  }

  if (!state.birthdayMonth) {
    errors.push({
      name: 'birthdayMonth',
      message: t('pages.registerPage.validationBirthdayRequired'),
    })
  }

  if (!state.birthdayYear) {
    errors.push({
      name: 'birthdayYear',
      message: t('pages.registerPage.validationBirthdayRequired'),
    })
  }

  if (!state.gender) {
    errors.push({
      name: 'gender',
      message: t('pages.registerPage.validationGenderRequired'),
    })
  }

  return errors
}

const isSubmitDisabled = computed(() =>
  submitState.value === 'loading'
  || !form.firstName.trim()
  || !form.lastName.trim()
  || !form.emailOrPhone.trim()
  || !form.password.trim()
  || !form.birthdayDay
  || !form.birthdayMonth
  || !form.birthdayYear
  || !form.gender,
)

const submitLabel = computed(() =>
  submitState.value === 'loading'
    ? t('pages.registerPage.submitting')
    : t('pages.registerPage.submit'),
)

const statusAlert = computed(() => {
  if (submitState.value === 'success') {
    return {
      color: 'success' as const,
      icon: 'i-ph-check-circle-fill',
      title: t('pages.registerPage.statusSuccessTitle'),
      description: t('pages.registerPage.statusSuccessDescription'),
    }
  }

  if (submitState.value === 'error') {
    return {
      color: 'error' as const,
      icon: 'i-ph-warning-circle-fill',
      title: t('pages.registerPage.statusErrorTitle'),
      description: t('pages.registerPage.statusErrorDescription'),
    }
  }

  return null
})

const handleRegister = async () => {
  submitState.value = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  submitState.value = 'success'
}

const handleFormError = () => {
  submitState.value = 'error'
}

watch(() => [
  form.firstName,
  form.lastName,
  form.emailOrPhone,
  form.password,
  form.birthdayDay,
  form.birthdayMonth,
  form.birthdayYear,
  form.gender,
], () => {
  if (submitState.value !== 'loading') {
    submitState.value = 'idle'
  }
})
</script>
