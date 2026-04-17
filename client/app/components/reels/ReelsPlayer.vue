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
        class="relative h-full w-full overflow-hidden bg-[#111] shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:max-w-[520px] sm:rounded-[1.6rem] sm:h-[calc(100dvh-104px)] lg:max-w-[460px] xl:max-w-[520px]"
      >
        <img
          :src="reel.cover"
          :alt="reel.title"
          class="h-full w-full object-cover"
        >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.08)_34%,rgba(0,0,0,0.28)_100%)]" />

        <button class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-white backdrop-blur-sm sm:left-5 sm:top-5" type="button">
          <span class="h-2 w-2 rounded-full bg-[#10b981]" />
          <span class="text-[0.78rem] font-semibold">Đang phát</span>
        </button>

        <button class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 sm:right-5 sm:top-5" type="button" aria-label="Thêm">
          <Icon name="i-ph-dots-three-outline-fill" class="h-5 w-5" />
        </button>

        <ReelsOverlay :reel="reel" />
      </div>
    </Transition>

    <div class="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 gap-2 text-[0.72rem] font-semibold text-white/65 md:flex">
      <span class="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">Vuốt lên/xuống để đổi reel</span>
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