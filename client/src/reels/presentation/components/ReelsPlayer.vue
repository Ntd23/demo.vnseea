<template>
  <div
    class="relative flex h-full min-h-0 w-full touch-pan-y items-center justify-center overscroll-contain"
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
        class="group/reel relative h-full max-h-full w-full overflow-hidden bg-black shadow-[0_0_80px_rgba(0,0,0,0.75)] ring-1 ring-white/10 sm:aspect-[9/16] sm:w-auto sm:max-w-[min(460px,calc(100vw-40px))] sm:rounded-[34px]"
      >
        <img
          :src="reel.cover"
          :alt="reel.title"
          class="h-full w-full select-none object-cover transition-transform duration-[1600ms] group-hover/reel:scale-[1.04]"
        >
        
        <div class="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/24 to-transparent" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/92 via-black/46 to-transparent" />

        <div class="absolute left-4 top-4 flex max-w-[calc(100%-88px)] items-center gap-2 rounded-full border border-white/12 bg-black/42 px-3 py-2 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md sm:left-5 sm:top-5">
          <span class="relative flex h-2 w-2 shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-70" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
          </span>
          <span class="truncate text-[11px] font-extrabold uppercase tracking-[0.16em]">{{ $t('pages.reelsPage.playing') }}</span>
          <span class="text-[11px] font-bold text-white/45">{{ currentIndex + 1 }}/{{ total }}</span>
        </div>

        <UButton
          icon="i-ph-dots-three-outline-vertical-duotone"
          variant="soft"
          class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/42 p-0 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all hover:bg-black/62 hover:text-primary-300 sm:right-5 sm:top-5"
          :aria-label="$t('pages.reelsPage.more')"
          size="md"
        />

        <ReelsOverlay :reel="reel" />

        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/10">
          <div
            class="h-full bg-primary-400 transition-[width] duration-300"
            :style="{ width: progressWidth }"
          />
        </div>
      </div>
    </Transition>

    <div class="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 md:block">
      <div class="rounded-full border border-white/10 bg-white/7 px-5 py-2 backdrop-blur-md">
        <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
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
    shares: number
    views: number
    music: string
    tags: string[]
    cover: string
    avatar: string
  }
  currentIndex: number
  total: number
}>()

const emit = defineEmits<{
  (event: 'next'): void
  (event: 'prev'): void
}>()

const touchStartY = ref<number | null>(null)
const wheelLock = ref(false)

const progressWidth = computed(() => `${((props.currentIndex + 1) / props.total) * 100}%`)

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
  }, 520)
}

const onKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault()
    emit('next')
  }

  if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    emit('prev')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
