<template>
  <aside
    class="relative flex h-full w-full flex-col justify-between gap-6 overflow-hidden lg:gap-0"
    aria-labelledby="auth-hero-panel-title"
    aria-describedby="auth-hero-panel-subtitle"
  >
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
      <div class="absolute -left-12 top-8 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
      <div class="absolute right-0 top-20 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
      <div class="absolute bottom-10 left-[12%] h-28 w-28 rounded-full bg-[#8aa4ff]/20 blur-3xl" />
      <div class="absolute left-[18%] top-[44%] h-px w-32 -rotate-12 bg-white/20" />
    </div>

    <header class="relative z-10">
      <div class="flex items-center gap-3 text-white/90">
        <div
          aria-hidden="true"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/20 text-[18px] font-bold shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
        >
          V
        </div>
        <div>
          <p class="text-[11px] font-semibold tracking-[0.35em] uppercase">{{ brandTagline }}</p>
          <p class="text-[14px] font-extrabold leading-none">VNSEEA</p>
        </div>
      </div>

      <div class="mt-8 max-w-[390px] lg:mt-12 xl:max-w-[420px]">
        <h2 id="auth-hero-panel-title" class="text-[34px] leading-[0.97] font-black tracking-[-0.07em] sm:text-[44px] xl:text-[54px]">
          {{ resolvedTitle }}
        </h2>
        <p id="auth-hero-panel-subtitle" class="mt-4 max-w-[330px] text-[15px] leading-7 text-white/85 sm:mt-6 sm:text-[16px] sm:leading-7">
          {{ resolvedSubtitle }}
        </p>
      </div>
    </header>

    <figure class="relative z-10 flex justify-center pb-1 lg:pb-0">
      <div aria-hidden="true" class="absolute -inset-x-8 bottom-0 h-36 rounded-full bg-white/10 blur-3xl sm:-inset-x-14 sm:h-48" />
      <div class="group relative w-full max-w-[300px] overflow-hidden rounded-[22px] border-[7px] border-white/25 bg-white/10 shadow-[0_22px_56px_rgba(0,0,0,0.2)] sm:max-w-[340px] sm:rounded-[26px] sm:border-[8px] xl:max-w-[360px]">
        <div aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_35%,rgba(8,26,134,0.3)_100%)]" />

        <NuxtImg
          v-if="showPreviewImage"
          :src="resolvedImageSrc"
          :alt="resolvedImageAlt"
          width="860"
          height="980"
          sizes="(max-width: 639px) 300px, (max-width: 1279px) 340px, 360px"
          loading="eager"
          decoding="async"
          class="relative z-10 h-[220px] w-full object-cover object-center opacity-95 transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03] sm:h-[260px] lg:h-[320px]"
          @error="handleImageError"
        />

        <div
          v-else
          aria-hidden="true"
          class="relative z-10 flex h-[220px] w-full items-end overflow-hidden bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(145deg,#355cff_0%,#1023a5_55%,#07135d_100%)] sm:h-[260px] lg:h-[320px]"
        >
          <div class="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/15 bg-white/10 shadow-[0_14px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm">
            <Icon aria-hidden="true" name="i-ph-users-three-fill" class="h-7 w-7 text-white/90" />
          </div>
          <div class="absolute -left-7 bottom-12 h-24 w-24 rounded-full border border-white/10 bg-white/10" />
          <div class="absolute right-10 top-20 h-16 w-16 rounded-full border border-white/10 bg-white/10" />
          <div class="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-[#061050]/70 to-transparent" />

          <div class="relative mt-auto space-y-2 p-5 sm:p-6">
            <span class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              {{ brandTagline }}
            </span>
            <div class="max-w-[240px]">
              <p class="text-[1.15rem] font-black leading-tight text-white sm:text-[1.35rem]">
                {{ resolvedTitle }}
              </p>
              <p class="mt-1.5 text-[12px] leading-5 text-white/80 sm:text-[13px]">
                {{ resolvedSubtitle }}
              </p>
            </div>
          </div>
        </div>

        <figcaption
          aria-hidden="true"
          class="absolute inset-x-4 bottom-4 z-20 rounded-[18px] border border-white/15 bg-[rgba(8,26,134,0.42)] px-3.5 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{{ brandTagline }}</p>
              <p class="mt-1 truncate text-[14px] font-extrabold text-white">{{ resolvedTitle }}</p>
            </div>

            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Icon aria-hidden="true" name="i-ph-arrow-up-right-bold" class="h-4.5 w-4.5" />
            </div>
          </div>
        </figcaption>
      </div>
    </figure>
  </aside>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle: string
  imageSrc?: string
  imageAlt?: string
}>(), {
  imageSrc: '',
  imageAlt: '',
})

const { t } = useI18n()
const hasImageError = ref(false)

watch(() => props.imageSrc, (value) => {
  hasImageError.value = !value?.trim()
}, { immediate: true })

const brandTagline = computed(() => t('navigation.headerLogo.tagline'))
const resolvedTitle = computed(() => props.title.trim() || t('auth.heroPanel.defaultTitle'))
const resolvedSubtitle = computed(() => props.subtitle.trim() || t('auth.heroPanel.defaultSubtitle'))
const resolvedImageSrc = computed(() => props.imageSrc.trim())
const resolvedImageAlt = computed(() => props.imageAlt.trim())
const showPreviewImage = computed(() => Boolean(resolvedImageSrc.value) && !hasImageError.value)

const handleImageError = () => {
  hasImageError.value = true
}
</script>
