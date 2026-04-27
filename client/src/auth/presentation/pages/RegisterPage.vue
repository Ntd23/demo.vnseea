<template>
  <div class="mx-auto w-full max-w-[720px]">
    <section class="flex flex-col gap-2">
      <p class="text-[13px] font-extrabold tracking-[0.32em] text-primary-600 uppercase">{{ $t('pages.registerPage.eyebrow') }}</p>
      <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-secondary-900 sm:text-[2.7rem]">{{ $t('pages.registerPage.title') }}</h1>
      <p class="max-w-[38rem] text-[1rem] leading-7 text-secondary-500">{{ $t('pages.registerPage.subtitle') }}</p>
    </section>

    <UForm
      :state="form"
      class="mt-8 flex flex-col gap-6"
      @submit="handleRegister"
    >
      <UAlert
        v-if="error"
        color="rose"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        :title="$t('pages.registerPage.statusErrorTitle')"
        :description="error"
        class="rounded-2xl"
      />

      <div class="grid gap-5 md:grid-cols-2">
        <UFormGroup
          name="firstName"
          :label="$t('pages.registerPage.firstName')"
          required
        >
          <UInput
            v-model="form.firstName"
            size="xl"
            :placeholder="$t('pages.registerPage.firstNamePlaceholder')"
            :ui="inputUi"
          />
        </UFormGroup>

        <UFormGroup
          name="lastName"
          :label="$t('pages.registerPage.lastName')"
          required
        >
          <UInput
            v-model="form.lastName"
            size="xl"
            :placeholder="$t('pages.registerPage.lastNamePlaceholder')"
            :ui="inputUi"
          />
        </UFormGroup>
      </div>

      <UFormGroup
        name="emailOrPhone"
        :label="$t('pages.registerPage.emailOrPhone')"
        required
      >
        <UInput
          v-model="form.emailOrPhone"
          size="xl"
          icon="i-ph-envelope-duotone"
          :placeholder="$t('pages.registerPage.emailOrPhonePlaceholder')"
          :ui="inputUi"
        />
      </UFormGroup>

      <UFormGroup
        name="password"
        :label="$t('pages.registerPage.newPassword')"
        required
      >
        <UInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          size="xl"
          icon="i-ph-lock-duotone"
          :placeholder="$t('pages.registerPage.newPasswordPlaceholder')"
          :ui="inputUi"
        >
          <template #trailing>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-400 transition hover:bg-primary-50 hover:text-primary-600"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'" class="h-5 w-5" />
            </button>
          </template>
        </UInput>
      </UFormGroup>

      <div class="space-y-4">
        <p class="text-xs font-black uppercase tracking-widest text-secondary-400 pl-1">
          {{ $t('pages.registerPage.birthday') }}
        </p>
        <div class="grid gap-3 md:grid-cols-3">
          <USelect
            v-model="form.birthdayDay"
            :items="dayOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.day')"
            :ui="selectUi"
          />
          <USelect
            v-model="form.birthdayMonth"
            :items="monthOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.month')"
            :ui="selectUi"
          />
          <USelect
            v-model="form.birthdayYear"
            :items="yearOptions"
            size="xl"
            :placeholder="$t('pages.registerPage.year')"
            :ui="selectUi"
          />
        </div>
      </div>

      <UFormGroup
        name="gender"
        :label="$t('pages.registerPage.gender')"
        required
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
      </UFormGroup>

      <UButton
        type="submit"
        :loading="state.status === 'loading'"
        color="primary"
        block
        size="xl"
        class="h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-[0.97]"
      >
        {{ $t('pages.registerPage.submit') }}
      </UButton>

      <p class="text-center text-sm font-medium text-secondary-500">
        {{ $t('pages.registerPage.hasAccount') }}
        <NuxtLink class="font-black text-primary-600 hover:text-primary-700 transition-colors ml-1" to="/welcome">
          {{ $t('pages.registerPage.login') }}
        </NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "../../application/composables/use-auth"
import type { RegisterPayload } from "../../domain/types/auth.types"

const { t } = useI18n()
const { state, register } = useAuth()

const form = reactive<RegisterPayload>({
  firstName: "",
  lastName: "",
  emailOrPhone: "",
  password: "",
  birthdayDay: undefined,
  birthdayMonth: undefined,
  birthdayYear: undefined,
  gender: undefined,
})

const showPassword = ref(false)
const error = ref("")

const inputUi = {
  rounded: 'rounded-2xl',
  size: { xl: 'h-16 px-6 font-semibold' },
  base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300'
}

const selectUi = {
  rounded: 'rounded-2xl',
  size: { xl: 'h-16 px-6 font-semibold' },
  base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300'
}

const radioGroupUi = {
  fieldset: 'grid grid-cols-1 gap-3 md:grid-cols-3',
  item: 'h-16 items-center rounded-2xl border px-4 transition-all hover:border-primary-200 hover:bg-primary-50/20 cursor-pointer',
  label: 'text-sm font-black text-secondary-900',
  base: 'size-5'
}

const currentYear = new Date().getFullYear()
const dayOptions = computed(() => Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })))
const monthOptions = computed(() => Array.from({ length: 12 }, (_, i) => ({ label: t('pages.registerPage.monthShort', { month: i + 1 }), value: String(i + 1) })))
const yearOptions = computed(() => Array.from({ length: 100 }, (_, i) => ({ label: String(currentYear - i), value: String(currentYear - i) })))

const genderOptions = computed(() => [
  { label: t('pages.registerPage.female'), value: 'female' },
  { label: t('pages.registerPage.male'), value: 'male' },
  { label: t('pages.registerPage.custom'), value: 'custom' },
])

const handleRegister = async () => {
  error.value = ""
  try {
    await register(form)
  } catch (e: any) {
    error.value = e.message
  }
}
</script>
