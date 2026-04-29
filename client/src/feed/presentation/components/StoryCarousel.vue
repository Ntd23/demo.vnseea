<template>
  <div class="story-rail">
    <div
      ref="scrollRef"
      class="story-rail__scroll scrollbar-hide"
    >
      <!-- Create story card -->
      <NuxtLink to="/status/create" class="story-card story-card--create">
        <div class="story-card__create-icon">
          <Icon name="i-ph-plus-bold" class="h-5 w-5" />
        </div>
        <span class="story-card__create-label">{{ t("feed.storyCarousel.createStory") }}</span>
      </NuxtLink>

      <!-- Story cards -->
      <button
        v-for="story in visibleStories"
        :key="story.id"
        class="story-card"
        :style="{ '--story-gradient': story.gradient }"
        type="button"
        :aria-label="t('feed.storyCarousel.openStory', { author: story.author })"
        @click="openStory(story.id)"
      >
        <div class="story-card__bg" :style="{ background: story.gradient }" />
        <img
          v-if="story.media"
          :src="story.media"
          :alt="story.author"
          class="story-card__bg-img"
          loading="lazy"
        >
        <div class="story-card__overlay" />
        <div class="story-card__avatar" :style="{ background: story.gradient }">
          {{ story.avatar }}
        </div>
        <p class="story-card__name">{{ story.author.split(" ").at(-1) }}</p>
      </button>
    </div>

    <!-- Scroll arrows -->
    <button
      v-if="canScrollLeft"
      class="story-rail__arrow story-rail__arrow--left"
      type="button"
      :aria-label="t('feed.storyCarousel.previousStory')"
      @click="scroll(-1)"
    >
      <Icon name="i-ph-caret-left-bold" class="h-3.5 w-3.5" />
    </button>
    <button
      v-if="canScrollRight"
      class="story-rail__arrow story-rail__arrow--right"
      type="button"
      :aria-label="t('feed.storyCarousel.nextStory')"
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
          v-if="activeStoryId !== null"
          class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm lg:flex lg:items-center lg:justify-center lg:px-6"
          @click.self="closeStory"
        >
          <div
            ref="dialogRef"
            class="relative h-dvh w-dvw overflow-hidden outline-none lg:h-[86vh] lg:w-full lg:max-w-[460px] lg:rounded-[28px] xl:max-w-[500px]"
            :style="{ background: activeStoryData?.gradient }"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            @touchstart.passive="onStoryTouchStart"
            @touchend.passive="onStoryTouchEnd"
          >
            <img
              v-if="activeStoryData?.media"
              :src="activeStoryData.media"
              :alt="activeStoryData.title || activeStoryData.author"
              class="absolute inset-0 h-full w-full object-cover"
            >
            <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />

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
                <p class="text-[11px] text-white/70">{{ activeStoryData?.meta ?? t("feed.storyCarousel.fallbackMeta") }}</p>
              </div>
            </div>

            <button
              class="absolute right-3 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
              type="button"
              @click="closeStory"
            >
              <Icon name="i-ph-x-bold" class="h-4 w-4" />
            </button>

            <button
              class="absolute inset-y-0 left-0 z-10 w-1/3"
              type="button"
              :aria-label="$t('feed.storyCarousel.previousStory')"
              @click="prevStory"
            />
            <button
              class="absolute inset-y-0 right-0 z-10 w-1/3"
              type="button"
              :aria-label="$t('feed.storyCarousel.nextStory')"
              @click="nextStory"
            />

            <div class="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
              <div class="max-w-[82%] rounded-2xl bg-black/25 px-5 py-4 backdrop-blur-sm">
                <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">{{ t("feed.storyCarousel.storyLabel") }}</p>
                <p class="mt-2 text-lg font-bold text-white">{{ activeStoryData?.title }}</p>
                <p class="mt-2 text-sm leading-6 text-white/85">{{ activeStoryData?.caption }}</p>
              </div>

              <UAlert
                v-if="feedbackMessage"
                color="neutral"
                variant="soft"
                icon="i-ph-check-circle-fill"
                :description="feedbackMessage"
                class="mt-3 rounded-[18px] border-white/10 bg-black/30 text-white"
              />

              <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div class="max-w-[78%] rounded-2xl bg-black/25 px-4 py-3 backdrop-blur-sm">
                  <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">{{ t("feed.storyCarousel.interactions") }}</p>
                  <div class="mt-3 flex flex-wrap items-center gap-5 text-white">
                    <div class="flex items-center gap-2">
                      <Icon name="i-ph-eye-fill" class="h-4 w-4" />
                      <span class="text-sm font-semibold">{{ activeMetrics?.views ?? 0 }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="i-ph-chats-circle-fill" class="h-4 w-4" />
                      <span class="text-sm font-semibold">{{ activeMetrics?.comments ?? 0 }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="i-ph-heart-fill" class="h-4 w-4 text-[#ff4d5a]" />
                      <span class="text-sm font-semibold">{{ activeMetrics?.likes ?? 0 }}</span>
                    </div>
                  </div>
                  <p class="mt-3 text-[11px] text-white/65">
                    {{ t("feed.storyCarousel.viewerHint") }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    type="button"
                    :aria-label="$t('feed.storyCarousel.actionLike')"
                    @click.stop="runStoryAction('like')"
                  >
                    <Icon name="i-ph-heart-fill" class="h-4 w-4 text-[#ff4d5a]" />
                  </button>
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    type="button"
                    :aria-label="$t('feed.storyCarousel.actionComment')"
                    @click.stop="runStoryAction('comment')"
                  >
                    <Icon name="i-ph-chats-circle-fill" class="h-4 w-4" />
                  </button>
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                    type="button"
                    :aria-label="$t('feed.storyCarousel.actionShare')"
                    @click.stop="runStoryAction('share')"
                  >
                    <Icon name="i-ph-share-network-fill" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core"
import { useMockSocialData } from "../../application/composables/useMockSocialData"

type StoryMetrics = {
  likes: number
  comments: number
  views: number
}

const { t } = useI18n()
const toast = useToast()
const { stories } = useMockSocialData()

const scrollRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const activeStoryId = ref<number | null>(null)
const feedbackMessage = ref("")
const storyTouchStartX = ref<number | null>(null)
const storyTouchStartY = ref<number | null>(null)
const storyMetrics = ref<Record<number, StoryMetrics>>(
  Object.fromEntries(
    stories.map(story => [story.id, {
      likes: story.likes,
      comments: story.comments,
      views: story.views,
    }]),
  ),
)

const visibleStories = computed(() => stories.filter(story => !story.isMe))
const storyQueue = computed(() => visibleStories.value)
const activeStoryData = computed(() =>
  activeStoryId.value !== null
    ? visibleStories.value.find(story => story.id === activeStoryId.value) ?? null
    : null,
)
const activeMetrics = computed(() =>
  activeStoryData.value ? storyMetrics.value[activeStoryData.value.id] : null,
)

const viewedStories = new Set<number>()

function updateScroll() {
  const el = scrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

function scroll(dir: 1 | -1) {
  scrollRef.value?.scrollBy({ left: dir * 220, behavior: "smooth" })
}

function openStory(storyId: number) {
  activeStoryId.value = storyId
}

function closeStory() {
  activeStoryId.value = null
  feedbackMessage.value = ""
}

function nextStory() {
  if (activeStoryId.value === null || !visibleStories.value.length) return
  const index = visibleStories.value.findIndex(story => story.id === activeStoryId.value)
  activeStoryId.value = visibleStories.value[(index + 1) % visibleStories.value.length]?.id ?? activeStoryId.value
}

function prevStory() {
  if (activeStoryId.value === null || !visibleStories.value.length) return
  const index = visibleStories.value.findIndex(story => story.id === activeStoryId.value)
  activeStoryId.value = visibleStories.value[(index - 1 + visibleStories.value.length) % visibleStories.value.length]?.id ?? activeStoryId.value
}

function setFeedback(message: string) {
  feedbackMessage.value = message
}

function runStoryAction(action: "like" | "comment" | "share") {
  const story = activeStoryData.value
  if (!story) return

  if (action === "like") {
    storyMetrics.value[story.id] = {
      ...storyMetrics.value[story.id],
      likes: storyMetrics.value[story.id].likes + 1,
    }
    setFeedback(t("feed.storyCarousel.actionLikeDone"))
  }

  if (action === "comment") {
    storyMetrics.value[story.id] = {
      ...storyMetrics.value[story.id],
      comments: storyMetrics.value[story.id].comments + 1,
    }
    setFeedback(t("feed.storyCarousel.actionCommentDone"))
  }

  if (action === "share") {
    setFeedback(t("feed.storyCarousel.actionShareDone"))
  }

  toast.add({
    color: "primary",
    icon: "i-ph-check-circle-fill",
    title: story.author,
    description: feedbackMessage.value,
  })
}

function onStoryTouchStart(event: TouchEvent) {
  const touch = event.changedTouches[0]
  storyTouchStartX.value = touch?.clientX ?? null
  storyTouchStartY.value = touch?.clientY ?? null
}

function onStoryTouchEnd(event: TouchEvent) {
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

useEventListener(scrollRef, "scroll", updateScroll, { passive: true })

if (import.meta.client) {
  useEventListener(window, "keydown", (event) => {
    if (activeStoryId.value === null) return

    if (event.key === "Escape") closeStory()
    if (event.key === "ArrowLeft") prevStory()
    if (event.key === "ArrowRight") nextStory()
  })
}

watch(
  visibleStories,
  async () => {
    await nextTick()
    updateScroll()
  },
  { deep: true, immediate: true },
)

watch(activeStoryId, async (storyId) => {
  feedbackMessage.value = ""

  if (storyId === null) return

  if (!viewedStories.has(storyId)) {
    viewedStories.add(storyId)
    storyMetrics.value[storyId] = {
      ...storyMetrics.value[storyId],
      views: storyMetrics.value[storyId].views + 1,
    }
  }

  await nextTick()
  dialogRef.value?.focus()
})
</script>

<style scoped>
.story-rail {
  position: relative;
}

.story-rail__scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* ---- Story card (small card style) ---- */
.story-card {
  position: relative;
  flex-shrink: 0;
  width: 110px;
  height: 160px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: none;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (min-width: 640px) {
  .story-card {
    width: 120px;
    height: 175px;
  }
}

.story-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.story-card__bg {
  position: absolute;
  inset: 0;
}

.story-card__bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.05) 50%, transparent 100%);
}

.story-card__avatar {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2.5px solid #ffffff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.story-card__name {
  position: absolute;
  bottom: 10px;
  left: 8px;
  right: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 2;
}

/* ---- Create story card ---- */
.story-card--create {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  border: 2px dashed rgba(0, 0, 255, 0.15);
  text-decoration: none;
}

.story-card--create:hover {
  border-color: rgba(0, 0, 255, 0.3);
  background: rgba(0, 0, 255, 0.02);
}

.story-card__create-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 255, 0.08);
  color: #0000ff;
  transition: all 0.15s ease;
}

.story-card--create:hover .story-card__create-icon {
  background: rgba(0, 0, 255, 0.12);
  transform: scale(1.05);
}

.story-card__create-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-align: center;
  line-height: 1.3;
}

/* ---- Scroll arrows ---- */
.story-rail__arrow {
  display: none;
  position: absolute;
  top: 50%;
  z-index: 10;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 255, 0.08);
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease;
}

@media (min-width: 640px) {
  .story-rail__arrow {
    display: inline-flex;
  }
}

.story-rail__arrow:hover {
  background: #0000ff;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 255, 0.2);
}

.story-rail__arrow--left {
  left: -8px;
}

.story-rail__arrow--right {
  right: -8px;
}

/* Scrollbar hide */
.scrollbar-hide {
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
