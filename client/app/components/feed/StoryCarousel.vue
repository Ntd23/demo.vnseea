<template>
  <div class="relative">
    <div
      ref="scrollRef"
      class="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide sm:gap-4"
      style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
    >
      <button class="flex shrink-0 flex-col items-center gap-1.5" type="button">
        <div class="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#0000ff]/10 sm:h-[68px] sm:w-[68px]">
          <Icon name="i-ph-plus-bold" class="h-5 w-5 text-[#0000ff]" />
          <div class="absolute inset-0 rounded-full ring-2 ring-[#0000ff]/30" />
        </div>
        <span class="text-[11px] font-semibold text-slate-600">Tạo tin</span>
      </button>

      <button
        v-for="story in visibleStories"
        :key="story.id"
        class="flex shrink-0 flex-col items-center gap-1.5"
        type="button"
        @click="openStory(story.id)"
      >
        <div class="relative">
          <div class="absolute -inset-[3px] rounded-full" :style="{ background: story.gradient }" />
          <div class="absolute -inset-[1px] rounded-full bg-[#f1f4fb]" />
          <div
            class="relative flex h-[60px] w-[60px] items-center justify-center rounded-full text-[16px] font-bold text-white sm:h-[68px] sm:w-[68px]"
            :style="{ background: story.gradient }"
          >
            {{ story.avatar }}
          </div>
        </div>
        <span class="w-[64px] truncate text-center text-[11px] font-semibold text-slate-600 sm:w-[72px]">
          {{ story.author.split(' ').at(-1) }}
        </span>
      </button>
    </div>

    <button
      v-if="canScrollLeft"
      class="absolute -left-2 top-[30px] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#0000ff]/10 bg-white text-[#0000ff] shadow-md transition hover:bg-[#0000ff]/5 sm:flex"
      type="button"
      @click="scroll(-1)"
    >
      <Icon name="i-ph-caret-left-bold" class="h-3.5 w-3.5" />
    </button>
    <button
      v-if="canScrollRight"
      class="absolute -right-2 top-[30px] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#0000ff]/10 bg-white text-[#0000ff] shadow-md transition hover:bg-[#0000ff]/5 sm:flex"
      type="button"
      @click="scroll(1)"
    >
      <Icon name="i-ph-caret-right-bold" class="h-3.5 w-3.5" />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="activeStory !== null"
          class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:px-6"
          @click.self="closeStory"
        >
          <div
            class="relative h-dvh w-dvw overflow-hidden lg:h-[86vh] lg:w-full lg:max-w-[460px] lg:rounded-[28px] xl:max-w-[500px]"
            :style="{ background: activeStoryData?.gradient }"
            @touchstart.passive="onStoryTouchStart"
            @touchend.passive="onStoryTouchEnd"
          >
            <div class="absolute left-0 right-0 top-3 z-20 flex gap-1 px-3">
              <div
                v-for="item in storyQueue"
                :key="item.id"
                class="h-0.5 flex-1 rounded-full bg-white/30"
              >
                <div
                  class="h-full rounded-full bg-white transition-all duration-300"
                  :class="item.id === activeStoryData?.id ? 'w-full' : 'w-0'"
                />
              </div>
            </div>

            <div class="absolute left-4 top-6 z-20 flex items-center gap-2">
              <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0000ff] text-xs font-bold text-white">
                {{ activeStoryData?.avatar }}
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ activeStoryData?.author }}</p>
                <p class="text-[11px] text-white/70">{{ activeStoryData?.meta ?? 'Vừa xong' }}</p>
              </div>
            </div>

            <button
              class="absolute right-3 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm lg:right-4 lg:top-4"
              type="button"
              @click="closeStory"
            >
              <Icon name="i-ph-x-bold" class="h-4 w-4" />
            </button>

            <button
              class="absolute inset-y-0 left-0 z-10 w-1/3"
              type="button"
              aria-label="Story trước"
              @click="prevStory"
            />
            <button
              class="absolute inset-y-0 right-0 z-10 w-1/3"
              type="button"
              aria-label="Story sau"
              @click="nextStory"
            />
            <div
              class="absolute inset-0 flex items-center justify-center bg-cover bg-center"
              :style="activeStoryData?.media ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.36)), url(${activeStoryData.media})` } : undefined"
            >
              <div class="max-w-[78%] rounded-2xl bg-black/20 px-6 py-4 text-center backdrop-blur-sm lg:max-w-[70%]">
                <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Story</p>
                <p class="mt-2 text-lg font-bold text-white">{{ activeStoryData?.title }}</p>
                <p class="mt-2 text-sm leading-6 text-white/85">{{ activeStoryData?.caption }}</p>
              </div>
            </div>

            <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-5">
              <div class="max-w-[70%] rounded-2xl bg-black/20 px-4 py-3 backdrop-blur-sm">
                <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Tương tác</p>
                <div class="mt-3 flex items-center gap-5 text-white">
                  <div class="flex items-center gap-2">
                    <Icon name="i-ph-eye-fill" class="h-4 w-4" />
                    <span class="text-sm font-semibold">{{ activeStoryData?.views ?? 0 }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-ph-chats-circle-fill" class="h-4 w-4" />
                    <span class="text-sm font-semibold">{{ activeStoryData?.comments ?? 0 }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Icon name="i-ph-heart-fill" class="h-4 w-4 text-[#ff4d5a]" />
                    <span class="text-sm font-semibold">{{ activeStoryData?.likes ?? 0 }}</span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <button class="story-action-pill story-action-pill--dark" type="button" aria-label="Like story">
                  <Icon name="i-ph-heart-fill" class="h-5 w-5 text-[#ff4d5a]" />
                </button>
                <button class="story-action-pill story-action-pill--dark" type="button" aria-label="Bình luận story">
                  <Icon name="i-ph-chats-circle-fill" class="h-5 w-5" />
                </button>
                <button class="story-action-pill story-action-pill--dark" type="button" aria-label="Chia sẻ story">
                  <Icon name="i-ph-share-network-fill" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { stories } = useMockSocialData()

const scrollRef = ref<HTMLElement>()
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const activeStory = ref<number | null>(null)
const storyTouchStartX = ref<number | null>(null)
const storyTouchStartY = ref<number | null>(null)

const visibleStories = computed(() => stories.filter(s => !s.isMe))
const storyQueue = computed(() => visibleStories.value)
const activeStoryData = computed(() =>
  activeStory.value !== null ? stories.find(s => s.id === activeStory.value) ?? null : null,
)

const openStory = (storyId: number) => {
  activeStory.value = storyId
}

const closeStory = () => {
  activeStory.value = null
}

const nextStory = () => {
  if (activeStory.value === null) return
  const index = visibleStories.value.findIndex(s => s.id === activeStory.value)
  activeStory.value = visibleStories.value[(index + 1) % visibleStories.value.length]?.id ?? activeStory.value
}

const prevStory = () => {
  if (activeStory.value === null) return
  const index = visibleStories.value.findIndex(s => s.id === activeStory.value)
  activeStory.value = visibleStories.value[(index - 1 + visibleStories.value.length) % visibleStories.value.length]?.id ?? activeStory.value
}


const onStoryTouchStart = (event: TouchEvent) => {
  const touch = event.changedTouches[0]
  storyTouchStartX.value = touch?.clientX ?? null
  storyTouchStartY.value = touch?.clientY ?? null
}

const onStoryTouchEnd = (event: TouchEvent) => {
  const startX = storyTouchStartX.value
  const startY = storyTouchStartY.value
  const touch = event.changedTouches[0]
  const endX = touch?.clientX ?? null
  const endY = touch?.clientY ?? null
  storyTouchStartX.value = null
  storyTouchStartY.value = null

  if (startX == null || startY == null || endX == null || endY == null) return

  const deltaX = startX - endX
  const deltaY = startY - endY

  if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) nextStory()
    else prevStory()
    return
  }

  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  const x = endX - rect.left
  const third = rect.width / 3

  if (x < third) prevStory()
  else if (x > third * 2) nextStory()
}

const scroll = (dir: 1 | -1) => {
  scrollRef.value?.scrollBy({ left: dir * 200, behavior: 'smooth' })
}

const updateScroll = () => {
  const el = scrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

onMounted(() => {
  scrollRef.value?.addEventListener('scroll', updateScroll, { passive: true })
  updateScroll()
})
onUnmounted(() => scrollRef.value?.removeEventListener('scroll', updateScroll))
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>