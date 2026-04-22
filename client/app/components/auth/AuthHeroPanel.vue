<template>
  <div class="flex h-full w-full flex-col justify-between gap-8 lg:gap-0">
    <div>
      <div class="flex items-center gap-3 text-white/90">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[18px] font-bold">V</div>
        <div>
          <div class="text-[11px] font-semibold tracking-[0.35em] uppercase">{{ $t("navigation.headerLogo.tagline") }}</div>
          <div class="text-[14px] font-extrabold leading-none">VNSEEA</div>
        </div>
      </div>

      <div class="mt-10 max-w-[460px] lg:mt-16">
        <h1 class="text-[42px] leading-[0.96] font-black tracking-[-0.08em] sm:text-[52px] xl:text-[64px]">{{ title }}</h1>
        <p class="mt-5 max-w-[380px] text-[16px] leading-7 text-white/85 sm:mt-8 sm:text-[18px] sm:leading-8">{{ subtitle }}</p>
      </div>
    </div>

    <div class="relative z-10 flex justify-center pb-2 lg:pb-0">
      <div class="absolute -inset-x-10 bottom-0 h-44 rounded-full bg-white/10 blur-3xl sm:-inset-x-20 sm:h-56" />
      <div class="relative w-full max-w-[360px] overflow-hidden rounded-[24px] border-[8px] border-white/25 bg-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.24)] sm:max-w-[430px] sm:rounded-[28px] sm:border-[10px]">
        <img :src="imageSrc" :alt="resolvedImageAlt" class="h-[260px] w-full object-cover object-center opacity-95 sm:h-[320px] lg:h-[420px]">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  imageSrc?: string
  imageAlt?: string
}>(), {
  imageSrc: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  imageAlt: '',
})

const { t } = useI18n()
const resolvedImageAlt = computed(() => props.imageAlt || t('auth.heroPanel.defaultImageAlt'))
</script>
