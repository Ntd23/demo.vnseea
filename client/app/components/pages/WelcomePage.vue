<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px] mx-auto space-y-10">
        <section class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t('pages.welcomePage.eyebrow') }}
          </p>
          <h1 class="text-5xl font-black leading-[0.9] tracking-tighter text-secondary-900 sm:text-6xl">
            {{ $t('pages.welcomePage.title') }}
          </h1>
          <p class="text-base font-medium leading-relaxed text-secondary-500 sm:text-lg">
            {{ $t('pages.welcomePage.subtitle') }}
          </p>
        </section>

        <section class="space-y-6">
          <div class="space-y-5">
            <UFormGroup
              :label="$t('pages.welcomePage.loginLabel')"
              label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
            >
              <UInput
                id="welcome-login"
                v-model="login"
                size="xl"
                icon="i-ph-user-duotone"
                :ui="{
                  base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                  icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
                }"
              />
            </UFormGroup>

            <UFormGroup
              label-class="w-full"
            >
              <template #label>
                <div class="flex items-center justify-between w-full mb-2 px-1">
                  <span class="text-[10px] font-black uppercase tracking-widest text-secondary-400">{{ $t('pages.welcomePage.passwordLabel') }}</span>
                  <NuxtLink class="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors" to="/forgot-password">{{ $t('pages.welcomePage.forgotPassword') }}</NuxtLink>
                </div>
              </template>
              <UInput
                id="welcome-password"
                v-model="password"
                size="xl"
                :type="showPassword ? 'text' : 'password'"
                icon="i-ph-lock-duotone"
                :ui="{
                  base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900 pr-12',
                  icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
                }"
              >
                <template #trailing>
                  <button type="button" class="flex items-center justify-center h-10 w-10 text-secondary-400 hover:text-primary-600 transition-colors" @click="showPassword = !showPassword">
                    <Icon :name="showPassword ? 'i-ph-eye-slash-duotone' : 'i-ph-eye-duotone'" class="h-5 w-5" />
                  </button>
                </template>
              </UInput>
            </UFormGroup>
          </div>

          <UButton
            size="xl"
            block
            :loading="loading"
            class="h-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98]"
            @click="handleLogin"
          >
            <template #leading>
              <Icon v-if="!loading" name="i-ph-sign-in-duotone" class="h-5 w-5" />
            </template>
            {{ loading ? $t('pages.welcomePage.loggingIn') : $t('pages.welcomePage.login') }}
          </UButton>

          <div class="flex items-center justify-center gap-1.5 py-4">
            <p class="text-xs font-medium text-secondary-400">{{ $t('pages.welcomePage.noAccount') }}</p>
            <NuxtLink class="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest decoration-primary-600/30 decoration-2 underline-offset-4 hover:underline" to="/register">
              {{ $t('pages.welcomePage.register') }}
            </NuxtLink>
          </div>
        </section>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const login = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const { t } = useI18n()
const heroProps = computed(() => ({
  title: t('pages.welcomePage.title'),
  subtitle: t('pages.welcomePage.subtitle'),
}))

const handleLogin = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 300))
  loading.value = false
}

useSeoMeta({ title: () => t('pages.welcomePage.seoTitle') })
</script>
