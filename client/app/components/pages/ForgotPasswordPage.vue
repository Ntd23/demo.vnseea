<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px] mx-auto space-y-10">
        <section class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t('pages.forgotPasswordPage.recoveryEyebrow') || 'Security' }}
          </p>
          <h1 class="text-5xl font-black leading-[0.9] tracking-tighter text-secondary-900 sm:text-6xl">
            {{ $t('pages.forgotPasswordPage.title') }}
          </h1>
          <p class="text-base font-medium leading-relaxed text-secondary-500 sm:text-lg">
            {{ $t('pages.forgotPasswordPage.subtitle') || 'Enter your email to recover your account.' }}
          </p>
        </section>

        <section class="space-y-6">
          <div class="space-y-5">
            <UFormGroup
              :label="$t('pages.forgotPasswordPage.emailLabel')"
              label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
            >
              <UInput
                id="reset-email"
                v-model="email"
                size="xl"
                icon="i-ph-envelope-duotone"
                autocomplete="email"
                :ui="{
                  base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                  icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
                }"
              />
            </UFormGroup>

            <!-- Captcha Section -->
            <div class="p-1 rounded-2xl bg-secondary-50 transition-all hover:bg-white ring-1 ring-secondary-100">
              <div class="flex h-14 items-center justify-between gap-3 px-4">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" class="h-5 w-5 rounded-lg border-secondary-200 text-primary-600 focus:ring-primary-500 transition-all">
                  <span class="text-[11px] font-black uppercase tracking-widest text-secondary-500 group-hover:text-primary-600 transition-colors">{{ $t('pages.forgotPasswordPage.captchaLabel') }}</span>
                </label>
                <div class="flex flex-col items-center justify-center">
                  <div class="h-6 w-6 rounded-lg bg-primary-600 shadow-sm flex items-center justify-center">
                    <Icon name="i-ph-shield-check-fill" class="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <UButton
            size="xl"
            block
            class="h-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98]"
          >
            <template #leading>
              <Icon name="i-ph-paper-plane-tilt-duotone" class="h-5 w-5" />
            </template>
            {{ $t('pages.forgotPasswordPage.submit') }}
          </UButton>

          <div class="flex items-center justify-center gap-1.5 py-2">
            <p class="text-xs font-medium text-secondary-400">{{ $t('pages.forgotPasswordPage.readyQuestion') }}</p>
            <NuxtLink class="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest decoration-primary-600/30 decoration-2 underline-offset-4 hover:underline" to="/welcome">
              {{ $t('pages.forgotPasswordPage.login') }}
            </NuxtLink>
          </div>
        </section>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const email = ref('')
const { t } = useI18n()
const heroProps = computed(() => ({
  title: t('pages.forgotPasswordPage.heroTitle'),
  subtitle: t('pages.forgotPasswordPage.heroSubtitle'),
}))
useSeoMeta({ title: () => t('pages.forgotPasswordPage.seoTitle') })
</script>
