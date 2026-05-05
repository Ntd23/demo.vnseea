<!-- Description: Displays real backend stories in the same rail-first order as the PHP home feed without mock reaction handlers. -->
<template>
  <div class="story-rail">
    <div
      ref="scrollRef"
      class="story-rail__scroll scrollbar-hide"
      @pointerdown="rememberStoryPointer"
      @pointerup="openStoryFromPointer"
    >
      <NuxtLink to="/status/create" class="story-card story-card--create">
        <div class="story-card__create-icon">
          <Icon name="i-ph-plus-bold" class="h-5 w-5" />
        </div>
        <span class="story-card__create-label">{{ t("feed.storyCarousel.createStory") }}</span>
      </NuxtLink>

      <button
        v-for="(group, groupIndex) in storyGroups"
        :key="group.key"
        class="story-card"
        :style="{ '--story-gradient': group.owner.gradient }"
        :data-story-group-index="groupIndex"
        type="button"
        :aria-label="t('feed.storyCarousel.openStory', { author: group.owner.author })"
        @click.stop="openStoryGroup(groupIndex)"
      >
        <div class="story-card__bg" :style="{ background: group.owner.gradient }" />
        <img
          v-if="group.owner.media"
          :src="group.owner.media"
          :alt="group.owner.author"
          class="story-card__bg-img"
          draggable="false"
          loading="lazy"
        >
        <div class="story-card__overlay" />
        <div class="story-card__avatar" :style="{ background: group.owner.gradient }">
          <img
            v-if="group.owner.avatarUrl"
            :src="group.owner.avatarUrl"
            :alt="group.owner.author"
            class="story-card__avatar-image"
            draggable="false"
          >
          <span v-else>{{ group.owner.avatar }}</span>
        </div>
        <p class="story-card__name">{{ group.owner.author.split(" ").at(-1) }}</p>
      </button>
    </div>

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

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="activeStoryData"
        class="story-viewer"
        @click.self="closeStory"
      >
        <div
          ref="dialogRef"
          class="story-viewer__dialog"
          :style="{ '--story-viewer-gradient': activeStoryData?.gradient || fallbackGradient }"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @touchstart.passive="onStoryTouchStart"
          @touchend.passive="onStoryTouchEnd"
        >
          <img
            v-if="activeStoryData?.media && !failedMediaStoryIds.has(activeStoryData.id)"
            :src="activeStoryData.media"
            :alt="activeStoryData.title || activeStoryData.author"
            class="story-viewer__media"
            draggable="false"
            @error="markStoryMediaFailed(activeStoryData?.id)"
          >
          <div v-else class="story-viewer__fallback">
            <div class="story-viewer__fallback-avatar">
              {{ activeStoryData?.avatar }}
            </div>
            <p class="story-viewer__fallback-title">{{ activeStoryData?.title || activeStoryData?.author }}</p>
          </div>
          <div class="story-viewer__shade" />

          <div class="story-viewer__progress">
            <div
              v-for="(item, itemIndex) in storyQueue"
              :key="`${item.id}-${itemIndex}`"
              class="story-viewer__progress-track"
            >
              <div
                class="story-viewer__progress-fill"
                :class="{ 'story-viewer__progress-fill--active': itemIndex === activeStoryItemIndex }"
              />
            </div>
          </div>

          <div class="story-viewer__author">
            <div class="story-viewer__author-avatar">
              <img
                v-if="activeStoryData?.avatarUrl"
                :src="activeStoryData.avatarUrl"
                :alt="activeStoryData.author"
                class="story-viewer__author-avatar-image"
                draggable="false"
              >
              <span v-else>{{ activeStoryData?.avatar }}</span>
            </div>
            <div>
              <p class="story-viewer__author-name">{{ activeStoryData?.author }}</p>
              <p v-if="activeStoryData?.meta" class="story-viewer__author-meta">{{ activeStoryData.meta }}</p>
            </div>
          </div>

          <button
            class="story-viewer__close"
            type="button"
            @click="closeStory"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>

          <button
            class="story-viewer__nav story-viewer__nav--previous"
            type="button"
            :aria-label="$t('feed.storyCarousel.previousStory')"
            @click="prevStory"
          />
          <button
            class="story-viewer__nav story-viewer__nav--next"
            type="button"
            :aria-label="$t('feed.storyCarousel.nextStory')"
            @click="nextStory"
          />

          <div v-if="activeStoryData?.caption" class="story-viewer__footer">
            <div class="story-viewer__caption">
              <p class="story-viewer__text">{{ activeStoryData.caption }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core"
import type { FeedStoryRecord } from "../../domain/types/feed.types"

type StoryGroup = {
  key: string
  owner: FeedStoryRecord
  stories: FeedStoryRecord[]
}

const { t } = useI18n()

const props = defineProps<{
  stories: FeedStoryRecord[]
}>()

const scrollRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const activeStoryGroupIndex = ref<number | null>(null)
const activeStoryItemIndex = ref(0)
const storyPointerStart = ref<{ x: number; y: number } | null>(null)
const storyTouchStartX = ref<number | null>(null)
const storyTouchStartY = ref<number | null>(null)

const resolveStoryOwnerKey = (story: FeedStoryRecord, index: number) =>
  story.ownerKey
  || (story.ownerId ? `user:${story.ownerId}` : "")
  || (story.ownerUsername ? `username:${story.ownerUsername}` : "")
  || (story.author ? `author:${story.author.toLowerCase()}` : "")
  || `story:${index}`

const storyGroups = computed<StoryGroup[]>(() => {
  const groups = new Map<string, StoryGroup>()

  props.stories.forEach((story, index) => {
    const key = resolveStoryOwnerKey(story, index)
    const existingGroup = groups.get(key)

    if (!existingGroup) {
      groups.set(key, {
        key,
        owner: story,
        stories: [story],
      })
      return
    }

    existingGroup.stories.push(story)

    if (story.id > existingGroup.owner.id) {
      existingGroup.owner = story
    }
  })

  return Array.from(groups.values()).map(group => ({
    ...group,
    stories: [...group.stories].sort((left, right) => right.id - left.id),
  }))
})
const activeStoryGroup = computed(() =>
  activeStoryGroupIndex.value !== null
    ? storyGroups.value[activeStoryGroupIndex.value] ?? null
    : null,
)
const storyQueue = computed(() => activeStoryGroup.value?.stories ?? [])
const activeStoryData = computed(() =>
  activeStoryGroupIndex.value !== null
    ? storyQueue.value[activeStoryItemIndex.value] ?? null
    : null,
)

const failedMediaStoryIds = ref(new Set<number>())
const fallbackGradient = "linear-gradient(135deg,#0f172a 0%,#1d4ed8 58%,#38bdf8 100%)"

function markStoryMediaFailed(storyId?: number) {
  if (!storyId) {
    return
  }

  failedMediaStoryIds.value = new Set([...failedMediaStoryIds.value, storyId])
}

function updateScroll() {
  const el = scrollRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 10
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

function scroll(dir: 1 | -1) {
  scrollRef.value?.scrollBy({ left: dir * 220, behavior: "smooth" })
}

function openStoryGroup(groupIndex: number, itemIndex = 0) {
  if (!Number.isInteger(groupIndex) || groupIndex < 0 || groupIndex >= storyGroups.value.length) {
    return
  }

  const groupStories = storyGroups.value[groupIndex]?.stories ?? []

  if (!groupStories.length) {
    return
  }

  activeStoryGroupIndex.value = groupIndex
  activeStoryItemIndex.value = Math.min(Math.max(itemIndex, 0), groupStories.length - 1)
}

function rememberStoryPointer(event: PointerEvent) {
  const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-story-group-index]")

  if (!trigger) {
    storyPointerStart.value = null
    return
  }

  storyPointerStart.value = {
    x: event.clientX,
    y: event.clientY,
  }
}

function openStoryFromPointer(event: PointerEvent) {
  const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-story-group-index]")
  const pointerStart = storyPointerStart.value
  storyPointerStart.value = null

  if (!trigger || !pointerStart) {
    return
  }

  const movedX = Math.abs(event.clientX - pointerStart.x)
  const movedY = Math.abs(event.clientY - pointerStart.y)

  if (movedX > 10 || movedY > 10) {
    return
  }

  const groupIndex = Number(trigger.dataset.storyGroupIndex)
  openStoryGroup(groupIndex)
}

function closeStory() {
  activeStoryGroupIndex.value = null
  activeStoryItemIndex.value = 0
}

function nextStory() {
  if (activeStoryGroupIndex.value === null || !storyGroups.value.length) return

  if (activeStoryItemIndex.value < storyQueue.value.length - 1) {
    activeStoryItemIndex.value += 1
    return
  }

  openStoryGroup((activeStoryGroupIndex.value + 1) % storyGroups.value.length)
}

function prevStory() {
  if (activeStoryGroupIndex.value === null || !storyGroups.value.length) return

  if (activeStoryItemIndex.value > 0) {
    activeStoryItemIndex.value -= 1
    return
  }

  const previousGroupIndex = (activeStoryGroupIndex.value - 1 + storyGroups.value.length) % storyGroups.value.length
  const previousGroup = storyGroups.value[previousGroupIndex]
  openStoryGroup(previousGroupIndex, Math.max((previousGroup?.stories.length ?? 1) - 1, 0))
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
    if (activeStoryGroupIndex.value === null) return

    if (event.key === "Escape") closeStory()
    if (event.key === "ArrowLeft") prevStory()
    if (event.key === "ArrowRight") nextStory()
  })
}

watch(
  storyGroups,
  async () => {
    const activeGroupIndex = activeStoryGroupIndex.value

    if (
      activeGroupIndex !== null
      && (activeGroupIndex < 0 || activeGroupIndex >= storyGroups.value.length)
    ) {
      activeStoryGroupIndex.value = storyGroups.value.length ? 0 : null
      activeStoryItemIndex.value = 0
    }

    const activeGroup = activeStoryGroup.value

    if (activeGroup && activeStoryItemIndex.value >= activeGroup.stories.length) {
      activeStoryItemIndex.value = Math.max(activeGroup.stories.length - 1, 0)
    }

    await nextTick()
    updateScroll()
  },
  { deep: true, immediate: true },
)

watch(activeStoryData, async (story) => {
  if (!story) return
  await nextTick()
  dialogRef.value?.focus()
})
</script>

<style scoped>
.story-rail {
  position: relative;
}

.story-viewer {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: rgba(0, 0, 0, 0.86);
  backdrop-filter: blur(10px);
}

@media (min-width: 1024px) {
  .story-viewer {
    align-items: center;
    padding: 0 24px;
  }
}

.story-viewer__dialog {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  outline: none;
  background: var(--story-viewer-gradient, linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%));
}

@media (min-width: 1024px) {
  .story-viewer__dialog {
    width: min(460px, calc(100vw - 48px));
    height: 86vh;
    border-radius: 28px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  }
}

@media (min-width: 1280px) {
  .story-viewer__dialog {
    width: min(500px, calc(100vw - 48px));
  }
}

.story-viewer__media,
.story-viewer__shade,
.story-viewer__fallback {
  position: absolute;
  inset: 0;
}

.story-viewer__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-viewer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  background: var(--story-viewer-gradient, linear-gradient(135deg, #0f172a 0%, #1d4ed8 58%, #38bdf8 100%));
  color: #ffffff;
  text-align: center;
}

.story-viewer__fallback-avatar {
  display: flex;
  width: 72px;
  height: 72px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.22);
  font-size: 20px;
  font-weight: 800;
}

.story-viewer__fallback-title {
  max-width: 280px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
}

.story-viewer__shade {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.42) 0%, rgba(0, 0, 0, 0.08) 42%, rgba(0, 0, 0, 0.68) 100%);
}

.story-viewer__progress {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 12px;
  z-index: 4;
  display: flex;
  gap: 4px;
}

.story-viewer__progress-track {
  height: 2px;
  flex: 1;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
}

.story-viewer__progress-fill {
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: #ffffff;
  transition: width 0.25s ease;
}

.story-viewer__progress-fill--active {
  width: 100%;
}

.story-viewer__author {
  position: absolute;
  left: 16px;
  top: 28px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #ffffff;
}

.story-viewer__author-avatar {
  display: flex;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: #0000ff;
  font-size: 12px;
  font-weight: 800;
}

.story-viewer__author-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-viewer__author-name {
  max-width: min(280px, calc(100vw - 112px));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 800;
}

.story-viewer__author-meta {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.story-viewer__close {
  position: absolute;
  right: 12px;
  top: 24px;
  z-index: 5;
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  backdrop-filter: blur(8px);
  transition: background 0.15s ease;
}

.story-viewer__close:hover {
  background: rgba(255, 255, 255, 0.32);
}

.story-viewer__nav {
  position: absolute;
  bottom: 0;
  top: 78px;
  z-index: 3;
  border: 0;
  background: transparent;
}

.story-viewer__nav--previous {
  left: 0;
  width: 33%;
}

.story-viewer__nav--next {
  right: 0;
  width: 33%;
}

.story-viewer__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  color: #ffffff;
}

@media (min-width: 640px) {
  .story-viewer__footer {
    padding: 20px;
  }
}

.story-viewer__caption {
  max-width: 82%;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.28);
  padding: 14px 16px;
  backdrop-filter: blur(8px);
}

.story-viewer__text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.84);
}

.story-rail__scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

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
  overflow: hidden;
  border-radius: 50%;
  border: 2.5px solid #ffffff;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.story-card__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
