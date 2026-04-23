<template>
  <div class="flex h-full w-full flex-col justify-between gap-12 lg:gap-0 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

    <div class="relative z-10">
      <div class="flex items-center gap-4 text-white">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-xl font-black shadow-2xl">
          V
        </div>
        <div class="space-y-0.5">
          <div class="text-[10px] font-black tracking-[0.4em] uppercase text-white/60 leading-none">
            {{ $t("navigation.headerBar.tagline") || 'Community Network' }}
          </div>
          <div class="text-lg font-black tracking-widest text-white leading-none">VNSEEA</div>
        </div>
      </div>

      <div class="mt-12 max-w-[520px] lg:mt-24 space-y-6">
        <h1 class="text-5xl leading-[0.9] font-black tracking-tighter sm:text-6xl xl:text-7xl text-white">
          {{ title }}
        </h1>
        <div class="h-1.5 w-24 bg-white/20 rounded-full" />
        <p class="max-w-[420px] text-lg leading-relaxed text-white/70 font-medium font-sans">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div class="relative z-10 flex justify-center lg:justify-start lg:pl-12 lg:pb-12">
      <!-- Image Shadow Glow -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/20 blur-[120px] rounded-full pointer-events-none opacity-50 lg:left-0 lg:translate-x-0" />
      
      <div class="relative w-full max-w-[420px] overflow-hidden rounded-[32px] border-[12px] border-white/10 bg-white/5 backdrop-blur-md shadow-[0_32px_80px_rgba(0,0,0,0.3)] group transition-transform duration-500 hover:scale-[1.02]">
        <img 
          :src="imageSrc" 
          :alt="resolvedImageAlt" 
          class="h-[300px] w-full object-cover object-center opacity-90 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100 sm:h-[380px] lg:h-[480px]"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-primary-950/40 to-transparent" />
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
