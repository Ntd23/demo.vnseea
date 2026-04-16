<template>
  <div class="relative">
    <!-- Scroll container -->
    <div
      ref="scrollRef"
      class="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide sm:gap-4"
      style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch;"
    >
      <!-- Create story (me) -->
      <button
        class="flex shrink-0 flex-col items-center gap-1.5"
        type="button"
      >
        <div class="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#0000ff]/10 sm:h-[68px] sm:w-[68px]">
          <Icon name="i-ph-plus-bold" class="h-5 w-5 text-[#0000ff]" />
          <!-- Blue ring -->
          <div class="absolute inset-0 rounded-full ring-2 ring-[#0000ff]/30" />
        </div>
        <span class="text-[11px] font-semibold text-slate-600">Tạo tin</span>
      </button>

      <!-- Other stories -->
      <button
        v-for="story in stories.filter(s => !s.isMe)"
        :key="story.id"
        class="flex shrink-0 flex-col items-center gap-1.5"
        type="button"
        @click="activeStory = story.id"
      >
        <div class="relative">
          <!-- Gradient ring (unseen) -->
          <div
            class="absolute -inset-[3px] rounded-full"
            :style="{ background: story.gradient }"
          />
          <!-- White gap -->
          <div class="absolute -inset-[1px] rounded-full bg-[#f1f4fb]" />
          <!-- Avatar circle -->
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

    <!-- Scroll arrows (desktop only) -->
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

    <!-- Story viewer modal -->
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
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          @click.self="activeStory = null"
        >
          <div
            class="relative h-[85vh] w-full max-w-sm overflow-hidden rounded-[24px] shadow-2xl"
            :style="{ background: activeStoryData?.gradient }"
          >
            <!-- Progress bar -->
            <div class="absolute left-0 right-0 top-3 flex gap-1 px-3">
              <div class="h-0.5 flex-1 rounded-full bg-white/30">
                <div class="h-full w-2/3 rounded-full bg-white" />
              </div>
            </div>
            <!-- Author -->
            <div class="absolute left-4 top-6 flex items-center gap-2">
              <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0000ff] text-xs font-bold text-white">
                {{ activeStoryData?.avatar }}
              </div>
              <div>
                <p class="text-sm font-bold text-white">{{ activeStoryData?.author }}</p>
                <p class="text-[11px] text-white/70">Vừa xong</p>
              </div>
            </div>
            <!-- Close -->
            <button
              class="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
              type="button"
              @click="activeStory = null"
            >
              <Icon name="i-ph-x-bold" class="h-4 w-4" />
            </button>
            <!-- Content placeholder -->
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="rounded-2xl bg-white/15 px-6 py-4 text-center text-lg font-bold text-white backdrop-blur-sm">
                Story của {{ activeStoryData?.author }}
              </p>
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

const activeStoryData = computed(() =>
  activeStory.value !== null ? stories.find(s => s.id === activeStory.value) : null,
)

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
