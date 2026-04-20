<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px]">
        <div class="mx-auto max-w-[420px]">
          <section class="flex flex-col gap-2">
            <p class="text-[13px] font-extrabold tracking-[0.32em] text-[#0000ff]">{{ $t('pages.registerPage.eyebrow') }}</p>
            <h1 class="text-[2.35rem] font-black leading-[0.95] tracking-[-0.08em] text-[#0000ff] sm:text-[2.7rem]">{{ $t('pages.registerPage.title') }}</h1>
            <p class="text-[1rem] leading-7 text-slate-500">{{ $t('pages.registerPage.subtitle') }}</p>
          </section>

          <section class="mt-7 flex flex-col gap-4">
            <div class="flex gap-3">
              <div class="field-group flex-1">
                <label class="field-label" for="register-firstname">{{ $t('pages.registerPage.firstName') }}</label>
                <input id="register-firstname" class="field-input" :placeholder="$t('pages.registerPage.firstNamePlaceholder')" type="text">
              </div>
              <div class="field-group flex-1">
                <label class="field-label" for="register-lastname">{{ $t('pages.registerPage.lastName') }}</label>
                <input id="register-lastname" class="field-input" :placeholder="$t('pages.registerPage.lastNamePlaceholder')" type="text">
              </div>
            </div>
            <div class="field-group">
              <label class="field-label" for="register-email">{{ $t('pages.registerPage.emailOrPhone') }}</label>
              <input id="register-email" class="field-input" autocomplete="username" placeholder="" type="text">
            </div>
            <div class="field-group">
              <label class="field-label" for="register-password">{{ $t('pages.registerPage.newPassword') }}</label>
              <div class="password-wrap">
                <input id="register-password" v-model="password" :type="showPassword ? 'text' : 'password'" class="field-input" autocomplete="new-password">
                <button class="password-toggle" type="button" :aria-label="showPassword ? $t('pages.registerPage.hidePassword') : $t('pages.registerPage.showPassword')" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  <svg v-else fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg>
                </button>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">{{ $t('pages.registerPage.birthday') }}</label>
              <div class="flex gap-2">
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">{{ $t('pages.registerPage.day') }}</option><option v-for="d in 31" :key="d" :value="d">{{ d }}</option></select>
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">{{ $t('pages.registerPage.month') }}</option><option v-for="m in 12" :key="m" :value="m">{{ $t('pages.registerPage.monthShort', { month: m }) }}</option></select>
                <select class="field-input flex-1 appearance-none px-3 py-2.5"><option value="">{{ $t('pages.registerPage.year') }}</option><option v-for="y in 50" :key="y" :value="2026 - y">{{ 2026 - y }}</option></select>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">{{ $t('pages.registerPage.gender') }}</label>
              <div class="flex gap-3">
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">{{ $t('pages.registerPage.female') }}</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="female"></label>
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">{{ $t('pages.registerPage.male') }}</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="male"></label>
                <label class="flex flex-1 cursor-pointer items-center justify-between rounded-[10px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"><span class="text-[14px] font-medium text-slate-700">{{ $t('pages.registerPage.custom') }}</span><input class="h-4 w-4 text-[#0000ff]" name="gender" type="radio" value="custom"></label>
              </div>
            </div>
            <button class="submit-button" type="button">{{ $t('pages.registerPage.submit') }}</button>
            <p class="register-row">{{ $t('pages.registerPage.hasAccount') }} <NuxtLink class="register-link" to="/welcome">{{ $t('pages.registerPage.login') }}</NuxtLink></p>
          </section>
        </div>
      </div>
    </template>
  </AuthSplitShell>
</template>

<script setup lang="ts">
const password = ref('')
const showPassword = ref(false)
const { t } = useI18n()
const heroProps = computed(() => ({
  title: t('pages.registerPage.heroTitle'),
  subtitle: t('pages.registerPage.subtitle'),
}))
useSeoMeta({ title: () => t('pages.registerPage.seoTitle') })
</script>
