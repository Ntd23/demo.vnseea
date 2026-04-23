<template>
  <div
    class="relative flex h-full w-full items-center justify-center p-0 sm:p-5"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @wheel.passive="onWheel"
  >
    <Transition
      enter-active-class="transition duration-400 ease-out"
      leave-active-class="transition duration-300 ease-in"
      enter-from-class="opacity-0 translate-y-12 scale-[0.98] blur-xl"
      enter-to-class="opacity-100 translate-y-0 scale-100 blur-0"
      leave-from-class="opacity-100 translate-y-0 scale-100 blur-0"
      leave-to-class="opacity-0 -translate-y-12 scale-[0.98] blur-xl"
      mode="out-in"
    >
      <div
        :key="reel.id"
        class="relative h-full w-full overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,0.8)] sm:max-w-[460px] sm:rounded-[40px] sm:h-[calc(100dvh-100px)] lg:max-w-[420px] ring-1 ring-white/10 group/reel"
      >
        <img
          :src="reel.cover"
          :alt="reel.title"
          class="h-full w-full object-cover select-none transition-transform duration-[2000ms] group-hover/reel:scale-110"
        >
        
        <!-- Premium Gradient Overlays -->
        <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        <div class="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <!-- Status Badge -->
        <div class="absolute left-6 top-6 flex items-center gap-2.5 rounded-2xl bg-black/40 px-4 py-2 text-white backdrop-blur-xl border border-white/10 transition-all group-hover/reel:bg-black/60">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
          </span>
          <span class="text-[9px] font-black uppercase tracking-[0.4em]">{{ $t('pages.reelsPage.playing') }}</span>
        </div>

        <UButton
          icon="i-ph-dots-three-outline-vertical-duotone"
          variant="soft"
          class="absolute right-6 top-6 h-10 w-10 rounded-2xl bg-black/40 text-white hover:bg-black/60 hover:text-primary-400 backdrop-blur-xl border border-white/10 transition-all flex items-center justify-center p-0"
          :aria-label="$t('pages.reelsPage.more')"
          size="md"
        />

        <ReelsOverlay :reel="reel" />
      </div>
    </Transition>

    <div class="pointer-events-none absolute bottom-12 left-1/2 hidden -translate-x-1/2 md:block">
      <div class="rounded-full bg-white/5 px-6 py-2.5 backdrop-blur-md border border-white/10 ring-1 ring-white/5 shadow-2xl">
        <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/50">
          {{ $t('pages.reelsPage.swipeHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ReelsOverlay from './ReelsOverlay.vue'

const props = defineProps<{
  reel: {
    id: number
    title: string
    author: string
    subtitle: string
    description: string
    likes: number
    comments: number
    cover: string
    avatar: string
  }
}>()

const emit = defineEmits<{
  (event: 'next'): void
  (event: 'prev'): void
}>()

const touchStartY = ref<number | null>(null)
const wheelLock = ref(false)

const onTouchStart = (event: TouchEvent) => {
  touchStartY.value = event.changedTouches[0]?.clientY ?? null
}

const onTouchEnd = (event: TouchEvent) => {
  const startY = touchStartY.value
  const endY = event.changedTouches[0]?.clientY ?? null
  touchStartY.value = null

  if (startY == null || endY == null) return
  const deltaY = startY - endY
  if (Math.abs(deltaY) < 50) return

  if (deltaY > 0) emit('next')
  else emit('prev')
}

const onWheel = (event: WheelEvent) => {
  if (wheelLock.value) return
  if (Math.abs(event.deltaY) < 12) return

  wheelLock.value = true
  if (event.deltaY > 0) emit('next')
  else emit('prev')

  window.setTimeout(() => {
    wheelLock.value = false
  }, 350)
}
</script>
