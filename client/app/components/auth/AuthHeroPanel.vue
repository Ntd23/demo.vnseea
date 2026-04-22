<template>
  <div class="relative flex h-full w-full flex-col justify-between gap-8 overflow-hidden lg:gap-0">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-12 top-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div class="absolute right-0 top-20 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
      <div class="absolute bottom-10 left-[12%] h-28 w-28 rounded-full bg-[#8aa4ff]/20 blur-3xl" />
      <div class="absolute left-[18%] top-[44%] h-px w-32 -rotate-12 bg-white/20" />
    </div>

    <div class="relative z-10">
      <div class="flex items-center gap-3 text-white/90">
        <div class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/20 text-[18px] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.15)]">V</div>
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
      <div class="group relative w-full max-w-[360px] overflow-hidden rounded-[24px] border-[8px] border-white/25 bg-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.24)] sm:max-w-[430px] sm:rounded-[28px] sm:border-[10px]">
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_35%,rgba(8,26,134,0.3)_100%)]" />

        <NuxtImg
          v-if="showPreviewImage"
          :src="imageSrc"
          :alt="resolvedImageAlt"
          width="860"
          height="980"
          sizes="(max-width: 639px) 360px, (max-width: 1279px) 430px, 430px"
          loading="eager"
          class="relative z-10 h-[260px] w-full object-cover object-center opacity-95 transition duration-500 group-hover:scale-[1.03] sm:h-[320px] lg:h-[420px]"
          @error="handleImageError"
        />

        <div
          v-else
          class="relative z-10 flex h-[260px] w-full items-end overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(145deg,#355cff_0%,#1023a5_55%,#07135d_100%)] sm:h-[320px] lg:h-[420px]"
        >
          <div class="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/15 bg-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
            <Icon name="i-ph-users-three-fill" class="h-8 w-8 text-white/90" />
          </div>
          <div class="absolute -left-8 bottom-16 h-28 w-28 rounded-full border border-white/10 bg-white/10" />
          <div class="absolute right-12 top-24 h-20 w-20 rounded-full border border-white/10 bg-white/10" />
          <div class="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#061050]/70 to-transparent" />

          <div class="relative mt-auto space-y-3 p-6 sm:p-7">
            <span class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              {{ $t("navigation.headerLogo.tagline") }}
            </span>
            <div class="max-w-[280px]">
              <p class="text-[1.3rem] font-black leading-tight text-white sm:text-[1.55rem]">
                {{ title }}
              </p>
              <p class="mt-2 text-[13px] leading-6 text-white/80 sm:text-[14px]">
                {{ subtitle }}
              </p>
            </div>
          </div>
        </div>

        <div class="absolute inset-x-5 bottom-5 z-20 rounded-[20px] border border-white/15 bg-[rgba(8,26,134,0.42)] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md">
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{{ $t("navigation.headerLogo.tagline") }}</p>
              <p class="mt-1 truncate text-[15px] font-extrabold text-white">{{ title }}</p>
            </div>

            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Icon name="i-ph-arrow-up-right-bold" class="h-5 w-5" />
            </div>
          </div>
        </div>
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
const hasImageError = ref(false)

watch(() => props.imageSrc, (value) => {
  hasImageError.value = !value
}, { immediate: true })

const resolvedImageAlt = computed(() => props.imageAlt || t('auth.heroPanel.defaultImageAlt'))
const showPreviewImage = computed(() => Boolean(props.imageSrc) && !hasImageError.value)

const handleImageError = () => {
  hasImageError.value = true
}
</script>
