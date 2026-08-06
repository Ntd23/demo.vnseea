<!-- English description: Displays real backend stories in the same rail-first order as the PHP home feed without mock reaction handlers. -->
<template>
  <div class="story-rail">
    <div
      ref="scrollRef"
      class="story-rail__scroll scrollbar-hide"
      @pointerdown="rememberStoryPointer"
      @pointerup="openStoryFromPointer"
    >
      <button
        type="button"
        class="story-card story-card--create"
        @click.stop="handleCreateStory"
      >
        <div class="story-card__create-icon">
          <Icon name="i-ph-plus-bold" class="h-5 w-5" />
        </div>
        <span class="story-card__create-label">{{ t("feed.storyCarousel.createStory") }}</span>
      </button>

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

    <Teleport to="body">
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
            :class="activeStoryMediaOrientation && `story-viewer__dialog--${activeStoryMediaOrientation}`"
            :style="{ '--story-viewer-gradient': activeStoryData?.gradient || fallbackGradient }"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            @touchstart.passive="onStoryTouchStart"
            @touchend.passive="onStoryTouchEnd"
          >
            <video
              v-if="activeStoryIsVideo && activeStoryData?.media && !failedMediaStoryIds.has(activeStoryData.id)"
              ref="activeVideoRef"
              :key="`video-${activeStoryData.id}`"
              :src="activeStoryData.media"
              :poster="activeStoryData.poster || undefined"
              class="story-viewer__media story-viewer__media--video"
              autoplay
              muted
              playsinline
              preload="auto"
              @ended="nextStory"
              @error="markStoryMediaFailed(activeStoryData?.id)"
              @pause="syncActiveVideoPlaybackState"
              @play="syncActiveVideoPlaybackState"
            />
            <NuxtImg
              v-else-if="activeStoryData?.media && !failedMediaStoryIds.has(activeStoryData.id)"
              :key="`image-${activeStoryData.id}`"
              :src="activeStoryData.media"
              :alt="activeStoryData.title || activeStoryData.author"
              class="story-viewer__media"
              loading="eager"
              sizes="100vw sm:500px"
              @load="handleActiveStoryImageLoad"
              @error="markStoryMediaFailed(activeStoryData?.id)"
            />
            <div v-else class="story-viewer__fallback">
              <div class="story-viewer__fallback-avatar">
                {{ activeStoryData?.avatar }}
              </div>
              <p class="story-viewer__fallback-title">{{ activeStoryData?.title || activeStoryData?.author }}</p>
            </div>
            <div class="story-viewer__shade" />

            <div
              class="story-viewer__progress"
              @touchstart.stop
              @touchend.stop
            >
              <button
                v-for="(item, itemIndex) in storyQueue"
                :key="`${item.id}-${itemIndex}`"
                class="story-viewer__progress-track"
                :class="{ 'story-viewer__progress-track--active': itemIndex === activeStoryItemIndex }"
                type="button"
                :aria-label="`${itemIndex + 1}/${storyQueue.length}: ${item.title || item.author}`"
                @click.stop="openStoryItem(itemIndex)"
              >
                <div
                  class="story-viewer__progress-fill"
                  :class="{ 'story-viewer__progress-fill--active': itemIndex === activeStoryItemIndex }"
                />
              </button>
            </div>

            <div
              class="story-viewer__author"
              :class="{ 'story-viewer__author--mine': activeStoryIsMine }"
            >
              <NuxtLink
                v-if="activeStoryProfilePath"
                :to="activeStoryProfilePath"
                class="story-viewer__author-avatar"
                @click.stop="closeStory"
              >
                <NuxtImg
                  v-if="activeStoryData?.avatarUrl"
                  :src="activeStoryData.avatarUrl"
                  :alt="activeStoryData.author"
                  class="story-viewer__author-avatar-image"
                  sizes="38px"
                />
                <span v-else>{{ activeStoryData?.avatar }}</span>
              </NuxtLink>
              <div v-else class="story-viewer__author-avatar">
                <NuxtImg
                  v-if="activeStoryData?.avatarUrl"
                  :src="activeStoryData.avatarUrl"
                  :alt="activeStoryData.author"
                  class="story-viewer__author-avatar-image"
                  sizes="38px"
                />
                <span v-else>{{ activeStoryData?.avatar }}</span>
              </div>
              <div class="story-viewer__author-copy">
                <NuxtLink
                  v-if="activeStoryProfilePath"
                  :to="activeStoryProfilePath"
                  class="story-viewer__author-name"
                  @click.stop="closeStory"
                >
                  {{ activeStoryData?.author }}
                </NuxtLink>
                <p v-else class="story-viewer__author-name">{{ activeStoryData?.author }}</p>
                <p
                  v-if="activeStoryIsMine"
                  class="story-viewer__author-status"
                >
                  <Icon :name="activeStoryAudienceIcon" class="story-viewer__author-status-icon" />
                  <span>{{ activeStoryAudienceLabel }}</span>
                </p>
                <p v-if="activeStoryData?.meta" class="story-viewer__author-meta">{{ activeStoryData.meta }}</p>
              </div>
            </div>

            <div
              v-if="activeStoryData?.overlays?.text"
              class="story-viewer__story-overlay story-viewer__story-overlay--text"
              :style="storyOverlayStyle(activeStoryData.overlays.text)"
            >
              {{ activeStoryData.overlays.text.content }}
            </div>
            <NuxtLink
              v-if="activeStoryData?.overlays?.mention && activeStoryMentionProfilePath"
              :to="activeStoryMentionProfilePath"
              class="story-viewer__story-overlay story-viewer__story-overlay--mention"
              :style="storyOverlayStyle(activeStoryData.overlays.mention)"
              @click.stop="closeStory"
            >
              {{ activeStoryData.overlays.mention.content }}
            </NuxtLink>
            <div
              v-else-if="activeStoryData?.overlays?.mention"
              class="story-viewer__story-overlay story-viewer__story-overlay--mention"
              :style="storyOverlayStyle(activeStoryData.overlays.mention)"
            >
              {{ activeStoryData.overlays.mention.content }}
            </div>
            <div
              v-if="activeStoryData?.caption && !activeStoryHasOverlays"
              class="story-viewer__story-text"
            >
              <p>{{ activeStoryData.caption }}</p>
            </div>

            <div
              class="story-viewer__actions"
              @touchstart.stop
              @touchend.stop
            >
              <UBadge
                v-if="activeStoryIsMine"
                class="story-viewer__views-pill"
                color="neutral"
                variant="soft"
                :aria-label="activeStoryViewsLabel"
                :title="activeStoryViewsLabel"
              >
                <Icon name="i-ph-eye-fill" class="story-viewer__views-icon" />
                <span>{{ activeStoryViewCount }}</span>
              </UBadge>
              <button
                v-if="activeStoryIsMine"
                class="story-viewer__action story-viewer__action--delete"
                type="button"
                :aria-label="t('feed.storyCarousel.deleteStory')"
                :title="t('feed.storyCarousel.deleteStory')"
                :disabled="storyActionState === 'loading'"
                @click.stop="requestDeleteStory"
              >
                <Icon name="i-ph-trash-fill" class="h-4 w-4" />
              </button>
              <button
                class="story-viewer__action"
                type="button"
                :aria-label="t('feed.storyCarousel.closeStory')"
                @click="closeStory"
              >
                <Icon name="i-ph-x-bold" class="h-4 w-4" />
              </button>
            </div>

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

            <button
              v-if="activeStoryIsVideo"
              class="story-viewer__video-toggle"
              type="button"
              :aria-label="activeVideoPaused ? 'Play story video' : 'Pause story video'"
              @click.stop="toggleActiveVideoPlayback"
            >
              <span v-if="activeVideoPaused" class="story-viewer__video-toggle-indicator">
                <Icon name="i-ph-play-fill" />
              </span>
            </button>

            <div class="story-viewer__footer">
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
                        v-for="(reaction, reactionIndex) in storyReactionOptions"
                        :key="reaction.value"
                        class="story-viewer__reaction-option"
                        :class="{ 'story-viewer__reaction-option--active': activeStoryReaction === reaction.value }"
                        :style="{ '--reaction-index': String(reactionIndex) }"
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
    </Teleport>

    <UModal
      :open="deleteConfirmOpen"
      :dismissible="storyActionState !== 'loading'"
      :title="t('feed.storyCarousel.deleteConfirmTitle')"
      :ui="{
        overlay: 'z-[2147483600]',
        content: 'z-[2147483647] sm:max-w-[420px]',
      }"
      @update:open="handleDeleteModalOpenChange"
    >
      <template #body>
        <p class="story-delete-modal__copy">
          {{ t("feed.storyCarousel.deleteConfirmDescription") }}
        </p>
        <p v-if="storyActionError" class="story-delete-modal__error">
          {{ storyActionError }}
        </p>
      </template>
      <template #footer>
        <div class="story-delete-modal__actions">
          <UButton
            color="neutral"
            variant="soft"
            :disabled="storyActionState === 'loading'"
            @click="cancelDeleteStory"
          >
            {{ t("feed.storyCarousel.cancel") }}
          </UButton>
          <UButton
            color="error"
            icon="i-ph-trash-fill"
            :loading="storyActionState === 'loading'"
            @click="deleteStory"
          >
            {{ t("feed.storyCarousel.confirmDelete") }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Story app interstitial temporarily disabled until the iOS and Android apps are released.
    <StoryAppInterstitial v-model="appPromptOpen" @continue="continueStoryOnWeb" />
    -->
  </div>
</template>

<script setup lang="ts">
import {
  feedStoryCreatePath,
} from "../../application/constants/story-carousel"
import { appRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useFeedStoryCarouselVM } from "../../application/view-models/useFeedStoryCarouselVM"
import type { FeedStoryOverlayItem, FeedStoryRecord } from "../../domain/types/feed.types"
/* Story app interstitial temporarily disabled until the iOS and Android apps are released.
import StoryAppInterstitial from "./StoryAppInterstitial.vue"
*/

const { t } = useI18n()
const router = useRouter()
/* Story app interstitial temporarily disabled until the iOS and Android apps are released.
const isMobileViewport = useMediaQuery("(max-width: 767px)")
const appPromptOpen = ref(false)
const storyAppPromptSkippedKey = "story-app-prompt-skipped"
*/
type StoryMediaOrientation = "portrait" | "landscape" | "square"
const activeStoryMediaOrientation = ref<StoryMediaOrientation | null>(null)

const props = defineProps<{
  stories: FeedStoryRecord[]
}>()
const {
  scrollRef,
  dialogRef,
  activeVideoRef,
  replyInputRef,
  canScrollLeft,
  canScrollRight,
  activeStoryItemIndex,
  replyText,
  reactionTrayOpen,
  activeVideoPaused,
  storyActionState,
  storyActionError,
  deleteConfirmOpen,
  storyReactionOptions,
  storyGroups,
  storyQueue,
  activeStoryData,
  activeStoryIsVideo,
  activeStoryReaction,
  activeReactionOption,
  activeStoryIsMine,
  canInteractWithActiveStory,
  activeStoryViewCount,
  activeStoryViewsLabel,
  failedMediaStoryIds,
  fallbackGradient,
  defaultFeedReactionAsset,
  resolveStoryCardMedia,
  markStoryMediaFailed,
  scroll,
  openStoryGroup,
  openStoryItem,
  rememberStoryPointer,
  openStoryFromPointer,
  closeStory,
  requestDeleteStory,
  cancelDeleteStory,
  handleDeleteModalOpenChange,
  deleteStory,
  focusReply,
  startReactionPress,
  finishReactionPress,
  cancelReactionPress,
  reactToStory,
  sendReply,
  nextStory,
  prevStory,
  toggleActiveVideoPlayback,
  syncActiveVideoPlaybackState,
  onStoryTouchStart,
  onStoryTouchEnd,
} = useFeedStoryCarouselVM(toRef(props, "stories"))

const activeStoryProfilePath = computed(() => {
  const username = activeStoryData.value?.ownerUsername?.trim()
  return username ? appRoutes.profile(username) : ""
})
const activeStoryMentionProfilePath = computed(() => {
  const username = activeStoryData.value?.overlays?.mention?.username?.trim()
  return username ? appRoutes.profile(username) : ""
})

const activeStoryHasOverlays = computed(() =>
  Boolean(activeStoryData.value?.overlays?.text || activeStoryData.value?.overlays?.mention),
)
const activeStoryAudienceLabel = computed(() =>
  t(`feed.storyCarousel.audiences.${activeStoryData.value?.audience || "public"}`),
)
const storyAudienceIcons: Record<FeedStoryRecord["audience"], string> = {
  public: "i-ph-globe-hemisphere-west-fill",
  friends: "i-ph-users-fill",
  followers: "i-ph-user-focus-fill",
  only_me: "i-ph-lock-key-fill",
}
const activeStoryAudienceIcon = computed(() =>
  storyAudienceIcons[activeStoryData.value?.audience || "public"],
)

function resolveStoryMediaOrientation(width: number, height: number): StoryMediaOrientation | null {
  if (!width || !height) {
    return null
  }

  const aspectRatio = width / height

  return aspectRatio > 1.08
    ? "landscape"
    : aspectRatio < 0.92
      ? "portrait"
      : "square"
}

function handleActiveStoryImageLoad(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  activeStoryMediaOrientation.value = resolveStoryMediaOrientation(
    image.naturalWidth,
    image.naturalHeight,
  )
}

function storyOverlayStyle(item: FeedStoryOverlayItem) {
  return {
    left: `${item.x * 100}%`,
    top: `${item.y * 100}%`,
  }
}

async function handleCreateStory() {
  /* Story app interstitial temporarily disabled until the iOS and Android apps are released.
  const appPromptSkipped = import.meta.client
    && sessionStorage.getItem(storyAppPromptSkippedKey) === "1"

  if (isMobileViewport.value && !appPromptSkipped) {
    appPromptOpen.value = true
    return
  }
  */

  await router.push(feedStoryCreatePath)
}

/* Story app interstitial temporarily disabled until the iOS and Android apps are released.
async function continueStoryOnWeb() {
  appPromptOpen.value = false
  if (import.meta.client) {
    sessionStorage.setItem(storyAppPromptSkippedKey, "1")
  }
  await router.push(feedStoryCreatePath)
}
*/

watch(() => activeStoryData.value?.id, () => {
  activeStoryMediaOrientation.value = null
})
</script>

<style scoped>
.story-rail {
  position: relative;
}

.story-viewer {
  position: fixed;
  inset: 0;
  z-index: 2147483500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  overscroll-behavior: contain;
}

@media (min-width: 1024px) {
  .story-viewer {
    align-items: center;
    padding: 0 24px;
  }
}

.story-viewer__dialog {
  position: relative;
  width: min(100vw, 56.25dvh);
  height: auto;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  outline: none;
  background: var(--story-viewer-gradient, linear-gradient(135deg, #0f172a 0%, var(--bg-brand-hover) 58%, #38bdf8 100%));
}

@media (min-width: 1024px) {
  .story-viewer__dialog {
    width: min(460px, 48.375dvh, calc(100vw - 48px));
    height: auto;
    border-radius: 28px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  }
}

@media (min-width: 1280px) {
  .story-viewer__dialog {
    width: min(500px, 48.375dvh, calc(100vw - 48px));
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

.story-viewer__media--video {
  object-fit: contain;
}

.story-viewer__dialog--landscape .story-viewer__media,
.story-viewer__dialog--square .story-viewer__media {
  object-fit: contain;
}

.story-viewer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  background: var(--story-viewer-gradient, linear-gradient(135deg, #0f172a 0%, var(--bg-brand-hover) 58%, #38bdf8 100%));
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
  display: block;
  height: 2px;
  flex: 1;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  padding: 0;
  cursor: pointer;
  transition: height 0.15s ease, background 0.15s ease;
}

.story-viewer__progress-track:hover,
.story-viewer__progress-track:focus-visible,
.story-viewer__progress-track--active {
  height: 4px;
  background: rgba(255, 255, 255, 0.46);
  outline: none;
}

.story-viewer__progress-fill {
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: var(--bg-surface);
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

.story-viewer__author--mine {
  right: 166px;
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
  background: var(--bg-brand);
  font-size: 12px;
  font-weight: 800;
}

.story-viewer__author-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-viewer__author-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.story-viewer__author-name {
  display: block;
  margin: 0;
  max-width: min(280px, calc(100vw - 112px));
  overflow: hidden;
  color: inherit;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 800;
}

.story-viewer__author-name:hover {
  text-decoration: underline;
}

.story-viewer__author-status {
  display: inline-flex;
  max-width: min(280px, calc(100vw - 112px));
  align-items: center;
  gap: 4px;
  overflow: hidden;
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.story-viewer__author-status-icon {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
}

.story-viewer__author-meta {
  margin-top: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.story-viewer__story-text {
  position: absolute;
  z-index: 4;
  top: 50%;
  left: 50%;
  width: min(84%, 350px);
  transform: translate(-50%, -50%);
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.36);
  padding: 12px 14px;
  color: #ffffff;
  text-align: center;
  backdrop-filter: blur(10px);
}

.story-viewer__story-text p {
  margin: 0;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 750;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.story-viewer__story-overlay {
  position: absolute;
  z-index: 4;
  width: min(72%, 320px);
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 800;
  line-height: 1.45;
  overflow-wrap: anywhere;
  text-align: center;
  text-shadow: 0 2px 7px rgba(0, 0, 0, 0.72);
  white-space: pre-wrap;
}

.story-viewer__story-overlay--mention {
  width: min(66%, 290px);
  color: #fde68a;
  cursor: pointer;
  text-decoration: none;
}

.story-viewer__story-overlay--mention:hover {
  text-decoration: underline;
}

.story-viewer__actions {
  position: absolute;
  right: 12px;
  top: 24px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.story-viewer__action {
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

.story-viewer__action:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.32);
}

.story-viewer__action:disabled {
  cursor: wait;
  opacity: 0.6;
}

.story-viewer__action--delete {
  background: rgba(127, 29, 29, 0.72);
}

.story-viewer__action--delete:hover:not(:disabled) {
  background: rgba(185, 28, 28, 0.88);
}

.story-delete-modal__copy {
  color: var(--text-secondary);
  line-height: 1.6;
}

.story-delete-modal__error {
  margin-top: 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-error-500) 12%, transparent);
  padding: 10px 12px;
  color: var(--color-error-600);
  font-size: 13px;
  font-weight: 700;
}

.story-delete-modal__actions {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 639px) {
  .story-viewer__actions {
    top: max(16px, env(safe-area-inset-top, 0px));
  }

  .story-delete-modal__actions {
    flex-direction: column-reverse;
  }

  .story-delete-modal__actions :deep(button) {
    width: 100%;
    justify-content: center;
  }
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

.story-viewer__video-toggle {
  position: absolute;
  top: 78px;
  right: 33%;
  bottom: 86px;
  left: 33%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
}

.story-viewer__video-toggle-indicator {
  display: inline-flex;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.42);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
}

.story-viewer__video-toggle-indicator svg,
.story-viewer__video-toggle-indicator :deep(svg) {
  width: 30px;
  height: 30px;
  transform: translateX(2px);
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
  min-width: 54px;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.32);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  flex-shrink: 0;
}

.story-viewer__views-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
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
  border-color: color-mix(in srgb, var(--bg-brand) 58%, transparent);
  background: color-mix(in srgb, var(--bg-brand) 20%, transparent);
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
  animation: story-reaction-tray-in 0.16s ease-out both;
  will-change: transform, opacity;
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
  touch-action: manipulation;
  transition: background 0.15s ease, transform 0.15s ease;
  will-change: transform;
}

.story-viewer__reaction-option:hover,
.story-viewer__reaction-option:focus-visible,
.story-viewer__reaction-option--active {
  background: transparent;
  transform: translateY(-8px) scale(1.18);
}

.story-viewer__reaction-symbol {
  width: 25px;
  height: 25px;
  object-fit: contain;
  pointer-events: none;
}

@keyframes story-reaction-tray-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  background: var(--bg-brand);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.story-viewer__bar-send:hover {
  background: var(--bg-brand-hover);
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
  background: var(--bg-surface);
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
  background: color-mix(in srgb, var(--bg-brand) 8%, transparent);
  color: var(--bg-brand);
  transition: all 0.15s ease;
}

.story-card--create:hover .story-card__create-icon {
  background: color-mix(in srgb, var(--bg-brand) 12%, transparent);
  transform: scale(1.05);
}

.story-card__create-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
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
  border: 1px solid color-mix(in srgb, var(--bg-brand) 8%, transparent);
  background: var(--bg-surface);
  color: var(--text-primary);
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
  background: var(--bg-brand);
  color: #ffffff;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--bg-brand) 20%, transparent);
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
