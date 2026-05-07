<!-- Description: Displays real backend stories in the same rail-first order as the PHP home feed without mock reaction handlers. -->
<template>
  <div class="story-rail">
    <div
      ref="scrollRef"
      class="story-rail__scroll scrollbar-hide"
      @pointerdown="rememberStoryPointer"
      @pointerup="openStoryFromPointer"
    >
      <NuxtLink :to="feedStoryCreatePath" class="story-card story-card--create">
        <div class="story-card__create-icon">
          <Icon name="i-ph-plus-bold" class="h-5 w-5" />
        </div>
        <span class="story-card__create-label">{{ t("feed.storyCarousel.createStory") }}</span>
      </NuxtLink>

      <button
        v-for="(group, groupIndex) in storyGroups"
        :key="group.key"
        class="story-card"
        :class="{ 'story-card--unseen': group.hasUnseen }"
        :style="{ '--story-gradient': group.owner.gradient }"
        :data-story-group-index="groupIndex"
        type="button"
        :aria-label="t('feed.storyCarousel.openStory', { author: group.owner.author })"
        @click.stop="openStoryGroup(groupIndex)"
      >
        <div class="story-card__bg" :style="{ background: group.owner.gradient }" />
        <NuxtImg
          v-if="resolveStoryCardMedia(group.owner)"
          :src="resolveStoryCardMedia(group.owner)"
          :alt="group.owner.author"
          class="story-card__bg-img"
          loading="lazy"
          sizes="120px"
        />
        <div class="story-card__overlay" />
        <div class="story-card__avatar" :style="{ background: group.owner.gradient }">
          <NuxtImg
            v-if="group.owner.avatarUrl"
            :src="group.owner.avatarUrl"
            :alt="group.owner.author"
            class="story-card__avatar-image"
            sizes="34px"
          />
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
          <video
            v-if="activeStoryIsVideo && activeStoryData?.media && !failedMediaStoryIds.has(activeStoryData.id)"
            :key="`video-${activeStoryData.id}`"
            :src="activeStoryData.media"
            :poster="activeStoryData.poster || undefined"
            class="story-viewer__media"
            autoplay
            muted
            playsinline
            controls
            preload="metadata"
            controlslist="nodownload"
            @ended="nextStory"
            @error="markStoryMediaFailed(activeStoryData?.id)"
          />
          <NuxtImg
            v-else-if="activeStoryData?.media && !failedMediaStoryIds.has(activeStoryData.id)"
            :key="`image-${activeStoryData.id}`"
            :src="activeStoryData.media"
            :alt="activeStoryData.title || activeStoryData.author"
            class="story-viewer__media"
            loading="eager"
            sizes="100vw sm:500px"
            @error="markStoryMediaFailed(activeStoryData?.id)"
          />
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
              <NuxtImg
                v-if="activeStoryData?.avatarUrl"
                :src="activeStoryData.avatarUrl"
                :alt="activeStoryData.author"
                class="story-viewer__author-avatar-image"
                sizes="38px"
              />
              <span v-else>{{ activeStoryData?.avatar }}</span>
            </div>
            <div>
              <p class="story-viewer__author-name">{{ activeStoryData?.author }}</p>
              <p v-if="activeStoryData?.meta" class="story-viewer__author-meta">{{ activeStoryData.meta }}</p>
            </div>
            <UBadge
              v-if="activeStoryIsMine"
              class="story-viewer__views-pill"
              color="neutral"
              variant="soft"
              :aria-label="activeStoryViewsLabel"
              :title="activeStoryViewsLabel"
            >
              <Icon name="i-ph-eye-fill" class="h-[14px] w-[14px]" />
              <span>{{ activeStoryData?.views ?? 0 }}</span>
            </UBadge>
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

          <div class="story-viewer__footer">
            <!-- Caption block -->
            <div v-if="activeStoryData?.caption" class="story-viewer__caption">
              <p class="story-viewer__text">{{ activeStoryData.caption }}</p>
            </div>

            <div v-if="canInteractWithActiveStory" class="story-viewer__bar">
              <div class="story-viewer__bar-reply" @click="focusReply">
                <UInput
                  ref="replyInputRef"
                  v-model="replyText"
                  class="story-viewer__bar-reply-input"
                  variant="none"
                  :placeholder="t('feed.storyCarousel.replyStory')"
                  type="text"
                  :disabled="storyActionState === 'loading'"
                  @keydown.enter.prevent="sendReply"
                  @keydown.escape.prevent="replyText = ''"
                />
                <UButton
                  v-if="replyText.trim()"
                  class="story-viewer__bar-send"
                  icon="i-ph-paper-plane-tilt-fill"
                  size="sm"
                  color="primary"
                  variant="solid"
                  type="button"
                  :aria-label="t('feed.storyCarousel.sendReply')"
                  :loading="storyActionState === 'loading'"
                  @click.stop="sendReply"
                />
              </div>

              <div class="story-viewer__reaction-shell">
                <Transition
                  enter-active-class="transition duration-150 ease-out"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition duration-100 ease-in"
                  leave-to-class="opacity-0 scale-95"
                >
                  <div
                    v-if="reactionTrayOpen"
                    class="story-viewer__reaction-tray"
                    @click.stop
                    @pointerdown.stop
                  >
                    <button
                      v-for="reaction in storyReactionOptions"
                      :key="reaction.value"
                      class="story-viewer__reaction-option"
                      :class="{ 'story-viewer__reaction-option--active': activeStoryReaction === reaction.value }"
                      type="button"
                      @click="reactToStory(reaction.value)"
                    >
                      <img
                        :src="reaction.src"
                      :alt="reaction.label"
                      class="story-viewer__reaction-symbol"
                      draggable="false"
                    >
                  </button>
                  </div>
                </Transition>

                <UButton
                  class="story-viewer__bar-react"
                  :class="{ 'story-viewer__bar-react--active': Boolean(activeReactionOption) }"
                  type="button"
                  color="neutral"
                  variant="soft"
                  :aria-label="t('feed.storyCarousel.reactStory')"
                  :disabled="storyActionState === 'loading'"
                  @pointerdown.stop.prevent="startReactionPress"
                  @pointerup.stop.prevent="finishReactionPress"
                  @pointerleave="cancelReactionPress"
                  @pointercancel="cancelReactionPress"
                >
                  <span class="story-viewer__bar-react-symbol">
                    <img
                      :src="activeReactionOption?.src ?? defaultFeedReactionAsset.src"
                      :alt="activeReactionOption?.label ?? t(defaultFeedReactionAsset.labelKey)"
                      class="story-viewer__bar-react-image"
                      draggable="false"
                    >
                  </span>
                </UButton>
              </div>
            </div>

            <p v-if="storyActionError" class="story-viewer__action-error">
              {{ storyActionError }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useEventListener, useTimeoutFn } from "@vueuse/core"
import {
  feedStoryCarouselScrollDistance,
  feedStoryCreatePath,
  feedStoryKeyboardKeys,
  feedStoryPointerTapTolerance,
  feedStoryReactionLongPressDelay,
  feedStorySwipeMinDistance,
  feedStoryVideoExtensions,
  feedStoryVideoPathHint,
  feedStoryViewerFallbackGradient,
  feedStoryViewerSideTapDivisor,
} from "../../application/constants/story-carousel"
import {
  defaultFeedReactionAsset,
  feedReactionAssets,
} from "../../application/constants/reaction-assets"
import { defaultFeedStoryReaction } from "../../domain/constants/story-reactions"
import type { FeedStoryReactionType, FeedStoryRecord } from "../../domain/types/feed.types"
import { createApiFeedRepository } from "../../infrastructure/repositories/ApiFeedRepository"

type StoryGroup = {
  key: string
  owner: FeedStoryRecord
  stories: FeedStoryRecord[]
  hasUnseen: boolean
}

const { t } = useI18n()
const toast = useToast()
const repository = createApiFeedRepository()

const props = defineProps<{
  stories: FeedStoryRecord[]
}>()

const scrollRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const replyInputRef = ref<{ $el?: HTMLElement } | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const activeStoryGroupIndex = ref<number | null>(null)
const activeStoryItemIndex = ref(0)
const storyPointerStart = ref<{ x: number; y: number } | null>(null)
const storyTouchStartX = ref<number | null>(null)
const storyTouchStartY = ref<number | null>(null)
const replyText = ref("")
const reactionTrayOpen = ref(false)
const reactionLongPressTriggered = ref(false)
const storyActionState = ref<"idle" | "loading" | "success" | "error">("idle")
const storyActionError = ref("")
const selectedReactionByStoryId = ref(new Map<number, FeedStoryReactionType>())
const viewedStoryIds = ref(new Set<number>())
const sentStoryViewIds = ref(new Set<number>())

const storyReactionOptions = computed<Array<{
  value: FeedStoryReactionType
  label: string
  src: string
}>>(() =>
  feedReactionAssets.map(reaction => ({
    value: reaction.value,
    label: t(reaction.labelKey),
    src: reaction.src,
  })),
)

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
        hasUnseen: story.hasUnseen && !viewedStoryIds.value.has(story.id),
      })
      return
    }

    existingGroup.stories.push(story)
    existingGroup.hasUnseen = existingGroup.hasUnseen || (story.hasUnseen && !viewedStoryIds.value.has(story.id))

    if (story.id > existingGroup.owner.id) {
      existingGroup.owner = story
    }
  })

  return Array.from(groups.values()).map(group => ({
    ...group,
    stories: [...group.stories].sort((left, right) => right.id - left.id),
    hasUnseen: group.stories.some(story => story.hasUnseen && !viewedStoryIds.value.has(story.id)),
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
const activeStoryIsVideo = computed(() => isVideoStory(activeStoryData.value))
const activeStoryReaction = computed(() =>
  activeStoryData.value
    ? selectedReactionByStoryId.value.get(activeStoryData.value.id) ?? null
    : null,
)
const activeReactionOption = computed(() =>
  storyReactionOptions.value.find(reaction => reaction.value === activeStoryReaction.value) ?? null,
)
const activeStoryIsMine = computed(() => Boolean(activeStoryData.value?.isMe))
const canInteractWithActiveStory = computed(() => Boolean(activeStoryData.value && !activeStoryIsMine.value))
const activeStoryViewsLabel = computed(() =>
  t("feed.storyCarousel.viewsLabel", { count: activeStoryData.value?.views ?? 0 }),
)

const failedMediaStoryIds = ref(new Set<number>())
const fallbackGradient = feedStoryViewerFallbackGradient
const storyVideoExtensionPattern = new RegExp(`\\.(${feedStoryVideoExtensions.join("|")})$`, "i")
const {
  start: startReactionLongPressTimer,
  stop: stopReactionLongPressTimer,
} = useTimeoutFn(() => {
  if (!canInteractWithActiveStory.value || storyActionState.value === "loading") {
    return
  }

  reactionLongPressTriggered.value = true
  reactionTrayOpen.value = true
}, feedStoryReactionLongPressDelay, { immediate: false })

function isVideoStoryMedia(media: string) {
  const normalized = media.toLowerCase().split(/[?#]/)[0] || ""
  return storyVideoExtensionPattern.test(normalized) || normalized.includes(feedStoryVideoPathHint)
}

function isVideoStory(story?: FeedStoryRecord | null) {
  if (!story) {
    return false
  }

  return story.mediaType === "video" || isVideoStoryMedia(story.media)
}

function resolveStoryCardMedia(story: FeedStoryRecord) {
  return isVideoStory(story)
    ? story.poster || ""
    : story.media || story.poster || ""
}

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
  scrollRef.value?.scrollBy({ left: dir * feedStoryCarouselScrollDistance, behavior: "smooth" })
}

function openStoryGroup(groupIndex: number, itemIndex = 0) {
  if (!Number.isInteger(groupIndex) || groupIndex < 0 || groupIndex >= storyGroups.value.length) {
    return
  }

  const activeGroup = storyGroups.value[groupIndex]
  const groupStories = activeGroup?.stories ?? []

  if (!groupStories.length) {
    return
  }

  markStoryGroupViewed(groupStories)
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

  if (movedX > feedStoryPointerTapTolerance || movedY > feedStoryPointerTapTolerance) {
    return
  }

  const groupIndex = Number(trigger.dataset.storyGroupIndex)
  openStoryGroup(groupIndex)
}

function closeStory() {
  activeStoryGroupIndex.value = null
  activeStoryItemIndex.value = 0
  replyText.value = ""
  reactionTrayOpen.value = false
  storyActionError.value = ""
  storyActionState.value = "idle"
}

async function markStoryViewed(story: FeedStoryRecord) {
  viewedStoryIds.value = new Set([...viewedStoryIds.value, story.id])

  if (sentStoryViewIds.value.has(story.id)) {
    return
  }

  sentStoryViewIds.value = new Set([...sentStoryViewIds.value, story.id])

  try {
    await repository.runStoryAction({
      action: "view",
      storyId: story.id,
    })
  }
  catch (error) {
    console.error(error)
  }
}

function markStoryGroupViewed(stories: FeedStoryRecord[]) {
  viewedStoryIds.value = new Set([
    ...viewedStoryIds.value,
    ...stories.map(story => story.id),
  ])
}

function focusReply() {
  if (!canInteractWithActiveStory.value) {
    return
  }

  const input = replyInputRef.value?.$el?.querySelector?.("input") as HTMLInputElement | null
  input?.focus()
}

function startReactionPress() {
  if (!canInteractWithActiveStory.value || storyActionState.value === "loading") {
    return
  }

  reactionLongPressTriggered.value = false
  startReactionLongPressTimer()
}

async function finishReactionPress() {
  stopReactionLongPressTimer()

  if (reactionLongPressTriggered.value) {
    return
  }

  await reactToStory(defaultFeedStoryReaction.value)
}

function cancelReactionPress() {
  stopReactionLongPressTimer()
}

async function reactToStory(reaction: FeedStoryReactionType) {
  const story = activeStoryData.value

  if (!story || !canInteractWithActiveStory.value || storyActionState.value === "loading") {
    return
  }

  storyActionState.value = "loading"
  storyActionError.value = ""

  try {
    await repository.runStoryAction({
      action: "react",
      storyId: story.id,
      reaction,
    })

    const nextReactions = new Map(selectedReactionByStoryId.value)
    nextReactions.set(story.id, reaction)
    selectedReactionByStoryId.value = nextReactions
    reactionTrayOpen.value = false
    storyActionState.value = "success"
  }
  catch (error) {
    console.error(error)
    storyActionState.value = "error"
    storyActionError.value = t("feed.storyCarousel.reactionFailed")
  }
}

async function sendReply() {
  const story = activeStoryData.value
  const text = replyText.value.trim()

  if (!story || !text || storyActionState.value === "loading") {
    return
  }

  if (story.isMe) {
    storyActionError.value = t("feed.storyCarousel.replyDisabledSelf")
    return
  }

  storyActionState.value = "loading"
  storyActionError.value = ""

  try {
    await repository.runStoryAction({
      action: "reply",
      storyId: story.id,
      ownerId: story.ownerId,
      text,
    })

    replyText.value = ""
    storyActionState.value = "success"
    toast.add({
      color: "success",
      icon: "i-ph-paper-plane-tilt-fill",
      title: t("feed.storyCarousel.replySent"),
    })
  }
  catch (error) {
    console.error(error)
    storyActionState.value = "error"
    storyActionError.value = t("feed.storyCarousel.replyFailed")
  }
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

  if (Math.abs(deltaX) > feedStorySwipeMinDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) nextStory()
    else prevStory()
    return
  }

  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  const x = endX - rect.left
  const third = rect.width / feedStoryViewerSideTapDivisor

  if (x < third) prevStory()
  else if (x > third * 2) nextStory()
}

useEventListener(scrollRef, "scroll", updateScroll, { passive: true })

if (import.meta.client) {
  useEventListener(window, "keydown", (event) => {
    if (activeStoryGroupIndex.value === null) return

    if (event.key === feedStoryKeyboardKeys.close) closeStory()
    if (event.key === feedStoryKeyboardKeys.previous) prevStory()
    if (event.key === feedStoryKeyboardKeys.next) nextStory()
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
  replyText.value = ""
  reactionTrayOpen.value = false
  storyActionError.value = ""
  storyActionState.value = "idle"
  await markStoryViewed(story)
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
  right: 56px; /* stop before the close button */
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
  gap: 10px;
  padding: 12px 12px calc(12px + env(safe-area-inset-bottom, 0px));
  color: #ffffff;
}

@media (min-width: 640px) {
  .story-viewer__footer {
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  }
}

.story-viewer__caption {
  max-width: 88%;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.32);
  padding: 12px 14px;
  backdrop-filter: blur(10px);
}

.story-viewer__text {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.story-viewer__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
}

.story-viewer__views-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.32);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}

.story-viewer__bar-react {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.36);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.story-viewer__bar-react:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.52);
  transform: scale(1.1);
}

.story-viewer__bar-react--active {
  border-color: rgba(59, 130, 246, 0.58);
  background: rgba(37, 99, 235, 0.2);
}

.story-viewer__bar-react-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.story-viewer__bar-react-image {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.story-viewer__reaction-shell {
  position: relative;
  display: flex;
  flex-shrink: 0;
}

.story-viewer__reaction-tray {
  position: absolute;
  right: -4px;
  bottom: 52px;
  z-index: 8;
  display: flex;
  gap: 10px;
  transform-origin: bottom right;
  border-radius: 999px;
  border: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
  filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.42));
}

.story-viewer__reaction-option {
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.story-viewer__reaction-option:hover,
.story-viewer__reaction-option--active {
  background: transparent;
}

.story-viewer__reaction-symbol {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

.story-viewer__bar-reply {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  height: 40px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(12px);
  padding: 0 4px 0 14px;
  cursor: text;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.story-viewer__bar-reply:focus-within {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.52);
}

.story-viewer__bar-reply-input {
  flex: 1;
  min-width: 0;
}

.story-viewer__bar-reply-input :deep(input) {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
}

.story-viewer__bar-reply-input :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.52);
}

.story-viewer__bar-send {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #0000ff;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.story-viewer__bar-send:hover {
  background: #2233ff;
  transform: scale(1.08);
}

.story-viewer__action-error {
  border-radius: 12px;
  background: rgba(127, 29, 29, 0.72);
  padding: 8px 10px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
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
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 0;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.story-card:not(.story-card--create)::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  border: 2px solid var(--bg-surface);
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.story-card--unseen:not(.story-card--create)::after {
  border-color: var(--color-primary-500);
  box-shadow:
    inset 0 0 0 1px var(--bg-surface),
    0 0 0 2px var(--color-primary-100),
    var(--shadow-md);
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
  border: 2.5px solid var(--bg-surface);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.story-card--unseen .story-card__avatar {
  border-color: var(--color-primary-500);
  box-shadow:
    0 0 0 2px var(--bg-surface),
    0 0 0 4px var(--color-primary-100),
    0 2px 8px rgba(0, 0, 0, 0.2);
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
  border: 2px dashed var(--border-default);
  text-decoration: none;
}

.story-card--create:hover {
  border-color: var(--border-strong);
  background: var(--bg-surface-hover);
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
