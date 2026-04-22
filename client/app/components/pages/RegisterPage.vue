<template>
  <AuthSplitShell :hero-props="heroProps">
    <template #right>
      <div class="w-full max-w-[420px] mx-auto space-y-10">
        <section class="space-y-3">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 pl-1">
            {{ $t('pages.registerPage.eyebrow') }}
          </p>
          <h1 class="text-5xl font-black leading-[0.9] tracking-tighter text-secondary-900 sm:text-6xl">
            {{ $t('pages.registerPage.title') }}
          </h1>
          <p class="text-base font-medium leading-relaxed text-secondary-500 sm:text-lg">
            {{ $t('pages.registerPage.subtitle') }}
          </p>
        </section>

        <section class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup
              :label="$t('pages.registerPage.firstName')"
              label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
            >
              <UInput
                id="register-firstname"
                size="xl"
                :placeholder="$t('pages.registerPage.firstNamePlaceholder')"
                :ui="{
                  base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                }"
              />
            </UFormGroup>
            <UFormGroup
              :label="$t('pages.registerPage.lastName')"
              label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
            >
              <UInput
                id="register-lastname"
                size="xl"
                :placeholder="$t('pages.registerPage.lastNamePlaceholder')"
                :ui="{
                  base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                }"
              />
            </UFormGroup>
          </div>

          <UFormGroup
            :label="$t('pages.registerPage.emailOrPhone')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <UInput
              id="register-email"
              size="xl"
              icon="i-ph-envelope-duotone"
              autocomplete="username"
              :ui="{
                base: 'h-14 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-medium text-secondary-900',
                icon: { leading: { pointer: 'pointer-events-none', base: 'text-primary-500' } }
              }"
            />
          </UFormGroup>

          <UFormGroup
            :label="$t('pages.registerPage.newPassword')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <UInput
              id="register-password"
              v-model="password"
              size="xl"
              :type="showPassword ? 'text' : 'password'"
              icon="i-ph-lock-duotone"
              autocomplete="new-password"
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

          <UFormGroup
            :label="$t('pages.registerPage.birthday')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <div class="flex gap-3">
              <select class="h-14 flex-1 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 px-4 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all duration-300">
                <option value="">{{ $t('pages.registerPage.day') }}</option>
                <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
              </select>
              <select class="h-14 flex-1 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 px-4 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all duration-300">
                <option value="">{{ $t('pages.registerPage.month') }}</option>
                <option v-for="m in 12" :key="m" :value="m">{{ $t('pages.registerPage.monthShort', { month: m }) }}</option>
              </select>
              <select class="h-14 flex-1 rounded-2xl bg-secondary-50/50 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 px-4 text-xs font-black uppercase tracking-widest appearance-none outline-none transition-all duration-300">
                <option value="">{{ $t('pages.registerPage.year') }}</option>
                <option v-for="y in 50" :key="y" :value="2026 - y">{{ 2026 - y }}</option>
              </select>
            </div>
          </UFormGroup>

          <UFormGroup
            :label="$t('pages.registerPage.gender')"
            label-class="text-[10px] font-black uppercase tracking-widest text-secondary-400 pl-1 mb-2"
          >
            <div class="flex gap-3">
              <label v-for="g in ['female', 'male', 'custom']" :key="g" class="flex-1 cursor-pointer group">
                <input class="sr-only peer" name="gender" type="radio" :value="g">
                <div class="h-14 flex items-center justify-center rounded-2xl bg-secondary-50/50 border border-secondary-100 transition-all duration-300 peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-primary-500/20 group-hover:border-primary-500/50">
                  <span class="text-[10px] font-black uppercase tracking-widest">{{ $t(`pages.registerPage.${g}`) }}</span>
                </div>
              </label>
            </div>
          </UFormGroup>

          <div class="pt-4 space-y-6">
            <UButton
              size="xl"
              block
              class="h-14 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.98]"
            >
              <template #leading>
                <Icon name="i-ph-user-plus-duotone" class="h-5 w-5" />
              </template>
              {{ $t('pages.registerPage.submit') }}
            </UButton>

            <div class="flex items-center justify-center gap-1.5 py-2">
              <p class="text-xs font-medium text-secondary-400">{{ $t('pages.registerPage.hasAccount') }}</p>
              <NuxtLink class="text-xs font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest decoration-primary-600/30 decoration-2 underline-offset-4 hover:underline" to="/welcome">
                {{ $t('pages.registerPage.login') }}
              </NuxtLink>
            </div>
          </div>
        </section>
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
