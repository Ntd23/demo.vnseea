<template>
  <div class="mx-auto w-full max-w-[720px]">
    <h2 class="text-[34px] font-extrabold tracking-[-0.06em] text-[#0000ff] sm:text-[38px] lg:text-[42px]">{{ $t('pages.forgotPasswordPage.title') }}</h2>

    <div class="mt-8 space-y-4 sm:mt-7">
      <div>
        <label for="reset-email" class="mb-2 block text-[14px] font-medium text-slate-600">{{ $t('pages.forgotPasswordPage.emailLabel') }}</label>
        <input id="reset-email" v-model="email" type="email" autocomplete="email" class="h-[3.85rem] w-full rounded-[1.45rem] border border-[#d5e4f0] bg-white px-5 text-[1rem] text-slate-900 outline-none transition focus:border-[#0000ff] focus:shadow-[0_0_0_4px_rgba(0,0,255,0.08)]">
      </div>

      <div class="w-fit rounded-[10px] border border-slate-300 bg-white p-1.5 shadow-sm">
        <div class="flex h-[62px] w-[234px] items-center justify-between gap-3 px-3">
          <label class="flex items-center gap-2 text-[12px] text-slate-700"><input type="checkbox" class="h-[18px] w-[18px] rounded border-slate-400 text-[#0000ff] focus:ring-[#0000ff]"><span>{{ $t('pages.forgotPasswordPage.captchaLabel') }}</span></label>
          <div class="flex flex-col items-center justify-center text-[10px] leading-none text-slate-500"><div class="h-6 w-6 rounded-sm border border-[#d7e3ef] bg-[#f7fbff]"></div><span class="mt-1">{{ $t('pages.forgotPasswordPage.captchaBrand') }}</span></div>
        </div>
      </div>

      <button class="h-[3.95rem] w-full rounded-[1.45rem] bg-[#0000ff] text-[1.05rem] font-black text-white shadow-[0_14px_32px_rgba(0,0,255,0.18)] transition hover:bg-[#0000dd]" type="button">{{ $t('pages.forgotPasswordPage.submit') }}</button>

      <p class="pt-1 text-center text-[0.95rem] text-slate-500 sm:text-[1rem]">
        {{ $t('pages.forgotPasswordPage.readyQuestion') }}
        <NuxtLink to="/welcome" class="font-extrabold text-[#0000ff]">{{ $t('pages.forgotPasswordPage.login') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const { t } = useI18n()
useSeoMeta({ title: () => t('pages.forgotPasswordPage.seoTitle') })
</script>
