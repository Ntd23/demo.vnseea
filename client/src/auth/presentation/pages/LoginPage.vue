<template>
  <div class="mx-auto w-full max-w-[720px]">
    <section class="flex flex-col gap-2">
      <p class="text-[13px] font-extrabold tracking-[0.32em] text-primary-600 uppercase">{{ $t('pages.welcomePage.eyebrow') }}</p>
      <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-secondary-900 sm:text-[2.7rem]">{{ $t('pages.welcomePage.title') }}</h1>
      <p class="max-w-[36rem] text-[1rem] leading-7 text-secondary-500">{{ $t('pages.welcomePage.subtitle') }}</p>
    </section>

    <UForm
      :state="form"
      class="mt-8 flex flex-col gap-6"
      @submit="handleLogin"
    >
      <UAlert
        v-if="error"
        color="rose"
        variant="soft"
        icon="i-ph-warning-circle-fill"
        :title="$t('pages.welcomePage.statusErrorTitle')"
        :description="error"
        class="rounded-2xl"
      />

      <div class="space-y-5">
        <UFormGroup
          name="login"
          :label="$t('pages.welcomePage.loginLabel')"
          required
        >
          <UInput
            v-model="form.login"
            size="xl"
            icon="i-ph-user"
            :placeholder="$t('pages.welcomePage.loginPlaceholder')"
            :ui="{ 
              rounded: 'rounded-2xl', 
              size: { xl: 'h-16 px-6 font-semibold' }, 
              base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
            }"
          />
        </UFormGroup>

        <UFormGroup
          name="password"
          required
        >
          <template #label>
            {{ $t('pages.welcomePage.passwordLabel') }}
          </template>
          <template #hint>
            <NuxtLink class="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors" to="/forgot-password">
              {{ $t('pages.welcomePage.forgotPassword') }}
            </NuxtLink>
          </template>
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            size="xl"
            icon="i-ph-lock-duotone"
            :placeholder="$t('pages.welcomePage.passwordPlaceholder')"
            :ui="{ 
              rounded: 'rounded-2xl', 
              size: { xl: 'h-16 px-6 font-semibold' }, 
              base: 'bg-secondary-50/50 hover:bg-white focus:bg-white ring-2 ring-transparent focus:ring-primary-500 transition-all duration-300' 
            }"
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
      </div>

      <UButton
        type="submit"
        :loading="state.status === 'loading'"
        color="primary"
        block
        size="xl"
        class="h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-700 active:scale-[0.97]"
      >
        {{ $t('pages.welcomePage.login') }}
      </UButton>

      <p class="text-center text-sm font-medium text-secondary-500">
        {{ $t('pages.welcomePage.noAccount') }}
        <NuxtLink class="font-black text-primary-600 hover:text-primary-700 transition-colors ml-1" to="/register">
          {{ $t('pages.welcomePage.register') }}
        </NuxtLink>
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "../../application/composables/use-auth"

const { state, login } = useAuth()
const form = reactive({
  login: "",
  password: "",
})

const showPassword = ref(false)
const error = ref("")

const handleLogin = async () => {
  error.value = ""
  try {
    await login(form)
    // Redirect logic would go here
  } catch (e: any) {
    error.value = e.message
  }
}
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

