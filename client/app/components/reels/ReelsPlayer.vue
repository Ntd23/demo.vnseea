<template>
  <div
    class="relative flex h-full w-full items-center justify-center"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
    @wheel.passive="onWheel"
  >
    <Transition
      enter-active-class="transition duration-250 ease-out"
      leave-active-class="transition duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-6 scale-[0.99]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-6 scale-[0.99]"
      mode="out-in"
    >
      <div
        :key="reel.id"
        class="relative h-full w-full overflow-hidden bg-secondary-950 shadow-2xl sm:max-w-[500px] sm:rounded-[2rem] sm:h-[calc(100dvh-120px)] lg:max-w-[440px] xl:max-w-[480px] border border-white/10"
      >
        <img
          :src="reel.cover"
          :alt="reel.title"
          class="h-full w-full object-cover select-none"
        >
        
        <!-- Gradient Overlays -->
        <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        <div class="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        <div class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-white backdrop-blur-md border border-white/10 sm:left-6 sm:top-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-[11px] font-black uppercase tracking-wider">{{ $t('pages.reelsPage.playing') }}</span>
        </div>

        <UButton
          icon="i-ph-dots-three-outline-fill"
          variant="soft"
          color="white"
          class="absolute right-4 top-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md sm:right-6 sm:top-6"
          :aria-label="$t('pages.reelsPage.more')"
          size="md"
        />

        <ReelsOverlay :reel="reel" />
      </div>
    </Transition>

    <div class="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
      <UBadge
        :label="$t('pages.reelsPage.swipeHint')"
        size="md"
        variant="soft"
        class="rounded-full bg-white/10 text-white backdrop-blur-md font-bold px-4 tracking-wide"
      />
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
