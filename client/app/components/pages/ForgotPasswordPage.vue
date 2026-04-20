<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px]">
        <h2 class="text-[34px] font-extrabold tracking-[-0.06em] text-[#0000ff] sm:text-[38px] lg:text-[42px]">{{ $t('pages.forgotPasswordPage.title') }}</h2>

        <div class="mt-6 space-y-4 sm:mt-7">
          <div>
            <label for="reset-email" class="mb-2 block text-[14px] font-medium text-slate-600">{{ $t('pages.forgotPasswordPage.emailLabel') }}</label>
            <input id="reset-email" v-model="email" type="email" autocomplete="email" class="h-[40px] w-full rounded-[10px] border border-[#d5e4f0] bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-[#0000ff] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.08)]">
          </div>

          <div class="w-fit rounded-[2px] border border-slate-300 bg-white p-1 shadow-sm">
            <div class="flex h-[58px] w-[214px] items-center justify-between gap-3 px-2">
              <label class="flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" class="h-[18px] w-[18px] rounded border-slate-400 text-[#0000ff] focus:ring-[#0000ff]"><span>{{ $t('pages.forgotPasswordPage.captchaLabel') }}</span></label>
              <div class="flex flex-col items-center justify-center text-[10px] leading-none text-slate-500"><div class="h-6 w-6 rounded-sm border border-[#d7e3ef] bg-[#f7fbff]"></div><span class="mt-1">{{ $t('pages.forgotPasswordPage.captchaBrand') }}</span></div>
            </div>
          </div>

          <button class="h-[40px] w-full rounded-[10px] bg-[#0000ff] text-[16px] font-semibold text-white transition hover:bg-[#0000dd]" type="button">{{ $t('pages.forgotPasswordPage.submit') }}</button>

          <p class="pt-1 text-center text-[13px] text-slate-500">
            {{ $t('pages.forgotPasswordPage.readyQuestion') }}
            <NuxtLink to="/welcome" class="text-slate-700 underline-offset-2 hover:underline">{{ $t('pages.forgotPasswordPage.login') }}</NuxtLink>
          </p>
        </div>
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
