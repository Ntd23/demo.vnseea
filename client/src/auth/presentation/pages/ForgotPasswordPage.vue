<template>
  <div class="mx-auto w-full max-w-[720px]">
    <section class="flex flex-col gap-2">
      <p class="text-[13px] font-extrabold tracking-[0.32em] text-primary-600 uppercase">{{ $t('pages.forgotPasswordPage.eyebrow') }}</p>
      <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-secondary-900 sm:text-[2.7rem]">{{ $t('pages.forgotPasswordPage.title') }}</h1>
      <p class="max-w-[38rem] text-[1rem] leading-7 text-secondary-500">{{ $t('pages.forgotPasswordPage.subtitle') }}</p>
    </section>

    <UForm
      :state="form"
      class="mt-8 flex flex-col gap-6"
      @submit="handleReset"
    >
      <UAlert
        v-if="status === 'success'"
        color="green"
        variant="soft"
        icon="i-ph-check-circle-fill"
        :title="$t('pages.forgotPasswordPage.statusSuccessTitle')"
        :description="$t('pages.forgotPasswordPage.statusSuccessDescription')"
        class="rounded-2xl"
      />

      <UAlert
        v-if="error"
        color="rose"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        :title="$t('pages.forgotPasswordPage.statusErrorTitle')"
        :description="error"
        class="rounded-2xl"
      />

      <UFormGroup
        name="emailOrPhone"
        :label="$t('pages.forgotPasswordPage.emailLabel')"
        required
      >
        <UInput
          v-model="form.emailOrPhone"
          size="xl"
          icon="i-ph-envelope-duotone"
          :placeholder="$t('pages.forgotPasswordPage.emailPlaceholder')"
          :ui="inputUi"
        />
      </UFormGroup>

      <UFormGroup
        name="captcha"
        required
      >
        <div class="flex items-center justify-between gap-4 rounded-2xl border border-secondary-100 bg-secondary-50/30 px-6 py-5 transition-all focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/5">
          <UCheckbox
            v-model="form.captchaConfirmed"
            :label="$t('pages.forgotPasswordPage.captchaLabel')"
            :ui="captchaCheckboxUi"
          />

          <div class="flex flex-col items-center justify-center gap-1.5 opacity-50">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 border border-secondary-200">
              <Icon name="i-ph-shield-check-duotone" class="h-6 w-6 text-primary-600" />
            </div>
            <span class="text-[9px] font-black uppercase tracking-widest text-secondary-400">
              {{ $t('pages.forgotPasswordPage.captchaBrand') }}
            </span>
          </div>
        </div>
      </UFormGroup>

      <UButton
        type="submit"
        :loading="loading"
        color="primary"
        block
        size="xl"
        class="h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-[0.97]"
      >
        {{ $t('pages.forgotPasswordPage.submit') }}
      </UButton>

      <p class="text-center text-sm font-medium text-secondary-500">
        {{ $t('pages.forgotPasswordPage.readyQuestion') }}
        <NuxtLink class="font-black text-primary-600 hover:text-primary-700 transition-colors ml-1" to="/welcome">
          {{ $t('pages.forgotPasswordPage.login') }}
        </NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  emailOrPhone: "",
  captchaConfirmed: false,
})

const loading = ref(false)
const status = ref<'idle' | 'success'>('idle')
const error = ref("")

const inputUi = {
  rounded: 'rounded-2xl',
  size: { xl: 'h-16 px-6 font-semibold' },
  base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300'
}

const captchaCheckboxUi = {
  label: 'text-sm font-black text-secondary-900',
  base: 'size-5'
}

const handleReset = async () => {
  if (!form.captchaConfirmed) return
  
  loading.value = true
  error.value = ""
  status.value = 'idle'
  
  try {
    // Mock simulation
    await new Promise(r => setTimeout(r, 1000))
    status.value = 'success'
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

