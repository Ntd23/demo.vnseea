<!-- English description: Renders a Messenger-style story reply preview with adaptive portrait, landscape, and square media. -->
<template>
  <div
    class="message-story"
    :class="[
      `message-story--${mediaOrientation}`,
      { 'message-story--mine': isMine },
    ]"
  >
    <p class="message-story__reply-label">
      <Icon name="i-ph-arrow-bend-up-left-bold" />
      <span>{{ replyLabel }}</span>
    </p>

    <button
      type="button"
      class="message-story__media-card"
      :class="{ 'message-story__media-card--disabled': !canOpen }"
      :disabled="!canOpen"
      :aria-label="canOpen ? t('navigation.chatWidget.openStoryReply') : unavailableLabel"
      @click.stop="viewerOpen = true"
    >
      <img
        v-if="hasVideoPoster"
        :src="story.posterUrl"
        :alt="story.title || story.author || t('navigation.chatWidget.storyReply')"
        class="message-story__preview-media message-story__preview-media--video"
        loading="lazy"
        @load="handleImageLoad"
        @error="markPosterFailed"
      >
      <video
        v-else-if="story.mediaType === 'video' && story.mediaUrl"
        :src="story.mediaUrl"
        class="message-story__preview-media message-story__preview-media--video"
        muted
        playsinline
        preload="auto"
        @loadedmetadata="handleVideoMetadata"
        @loadeddata="prepareVideoPreview"
      />
      <img
        v-else-if="story.mediaUrl"
        :src="story.mediaUrl"
        :alt="story.title || story.author || t('navigation.chatWidget.storyReply')"
        class="message-story__preview-media"
        loading="lazy"
        @load="handleImageLoad"
      >
      <span v-else class="message-story__fallback">
        <Icon name="i-ph-images-square-duotone" />
      </span>

      <span v-if="story.mediaType === 'video' && canOpen" class="message-story__play">
        <Icon name="i-ph-play-fill" />
      </span>
      <span v-if="!canOpen" class="message-story__unavailable">
        {{ unavailableLabel }}
      </span>
    </button>

    <p
      v-if="replyText"
      class="message-story__reply-bubble"
      :class="{ 'message-story__reply-bubble--mine': isMine }"
    >
      {{ replyText }}
    </p>

    <Teleport to="body">
      <Transition name="message-story-viewer">
        <div
          v-if="viewerOpen && canOpen"
          class="message-story__viewer"
          role="dialog"
          aria-modal="true"
          :aria-label="t('navigation.chatWidget.storyViewerLabel')"
          @click.self="closeViewer"
        >
          <button
            type="button"
            class="message-story__close"
            :aria-label="t('navigation.chatWidget.closeStoryViewer')"
            @click="closeViewer"
          >
            <Icon name="i-ph-x-bold" />
          </button>

          <article
            class="message-story__stage"
            :class="`message-story__stage--${mediaOrientation}`"
          >
            <header class="message-story__header">
              <UAvatar :src="story.avatarUrl" :alt="story.author" size="sm" />
              <div>
                <strong>{{ story.author || t("navigation.chatWidget.storyFallbackAuthor") }}</strong>
                <span>{{ story.title || t("navigation.chatWidget.storyReply") }}</span>
              </div>
            </header>

            <video
              v-if="story.mediaType === 'video'"
              :src="story.mediaUrl"
              :poster="story.posterUrl"
              class="message-story__viewer-media"
              controls
              autoplay
              playsinline
              @loadedmetadata="handleVideoMetadata"
            />
            <img
              v-else
              :src="story.mediaUrl"
              :alt="story.title || story.author || t('navigation.chatWidget.storyReply')"
              class="message-story__viewer-media"
              @load="handleImageLoad"
            >

            <footer v-if="story.caption" class="message-story__caption">
              {{ story.caption }}
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MessageStoryContext } from "../../domain/types/messages.types"

type StoryMediaOrientation = "portrait" | "landscape" | "square"

const props = defineProps<{
  story: MessageStoryContext
  isMine?: boolean
  messageAuthor?: string
  replyText?: string
}>()

const { t } = useI18n()
const viewerOpen = ref(false)
const mediaOrientation = ref<StoryMediaOrientation>("portrait")
const failedPosterUrl = ref("")
const canOpen = computed(() => props.story.available && Boolean(props.story.mediaUrl))
const hasVideoPoster = computed(() =>
  props.story.mediaType === "video"
  && Boolean(props.story.posterUrl)
  && failedPosterUrl.value !== props.story.posterUrl,
)
const unavailableLabel = computed(() => t("navigation.chatWidget.storyUnavailable"))
const replyLabel = computed(() => {
  const name = props.isMine
    ? props.story.author || t("navigation.chatWidget.storyFallbackAuthor")
    : props.messageAuthor || t("navigation.chatWidget.storyFallbackAuthor")

  return props.isMine
    ? t("navigation.chatWidget.storyReplyMine", { name })
    : t("navigation.chatWidget.storyReplyOther", { name })
})

function updateOrientation(width: number, height: number) {
  if (width <= 0 || height <= 0) return

  const ratio = width / height
  mediaOrientation.value = ratio > 1.15
    ? "landscape"
    : ratio < 0.86
      ? "portrait"
      : "square"
}

function handleImageLoad(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  updateOrientation(image.naturalWidth, image.naturalHeight)
}

function handleVideoMetadata(event: Event) {
  const video = event.currentTarget as HTMLVideoElement
  updateOrientation(video.videoWidth, video.videoHeight)
}

function prepareVideoPreview(event: Event) {
  const video = event.currentTarget as HTMLVideoElement

  video.pause()
  if (!hasVideoPoster.value && Number.isFinite(video.duration) && video.duration > 0.1) {
    video.currentTime = Math.min(0.1, video.duration / 2)
  }
}

function markPosterFailed() {
  failedPosterUrl.value = props.story.posterUrl || ""
}

function closeViewer() {
  viewerOpen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && viewerOpen.value) {
    closeViewer()
  }
}

watch(() => props.story.id, () => {
  viewerOpen.value = false
  mediaOrientation.value = "portrait"
  failedPosterUrl.value = ""
})

onMounted(() => document.addEventListener("keydown", handleKeydown))
onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown))
</script>

<style scoped>
.message-story {
  position: relative;
  display: flex;
  max-width: 100%;
  flex-direction: column;
  align-items: flex-start;
  padding-bottom: 20px;
}

.message-story--mine {
  align-items: flex-end;
}

.message-story__reply-label {
  display: flex;
  max-width: 100%;
  align-items: center;
  gap: 7px;
  margin: 0 2px 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
}

.message-story__reply-label svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
}

.message-story__reply-label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-story__media-card {
  position: relative;
  display: block;
  max-width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 16px;
  background: var(--bg-media);
  padding: 0;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.message-story--portrait .message-story__media-card {
  width: min(270px, calc(100vw - 110px));
  aspect-ratio: 9 / 14;
}

.message-story--landscape .message-story__media-card {
  width: min(400px, calc(100vw - 110px));
  aspect-ratio: 16 / 10;
}

.message-story--square .message-story__media-card {
  width: min(310px, calc(100vw - 110px));
  aspect-ratio: 1;
}

.message-story__media-card:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.message-story__media-card--disabled {
  cursor: default;
}

.message-story__preview-media,
.message-story__fallback {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.message-story__preview-media {
  object-fit: cover;
  pointer-events: none;
}

.message-story__preview-media--video {
  object-fit: contain;
}

.message-story__fallback {
  background: linear-gradient(145deg, var(--bg-media), color-mix(in srgb, var(--bg-brand) 58%, var(--bg-media)));
  color: var(--text-media);
}

.message-story__fallback svg {
  width: 38px;
  height: 38px;
}

.message-story__play {
  position: absolute;
  inset: 50% auto auto 50%;
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border: 1px solid var(--border-media);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 56%, transparent);
  color: var(--text-media);
  backdrop-filter: blur(8px);
}

.message-story__play svg {
  width: 19px;
  height: 19px;
}

.message-story__unavailable {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  padding: 20px;
  color: var(--text-media);
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.message-story__reply-bubble {
  position: absolute;
  z-index: 2;
  bottom: 2px;
  left: -8px;
  max-width: min(78%, 280px);
  margin: 0;
  border-radius: 16px 16px 16px 5px;
  background: var(--bg-muted);
  padding: 10px 15px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
  box-shadow: var(--shadow-md);
}

.message-story__reply-bubble--mine {
  right: -8px;
  left: auto;
  border-radius: 16px 16px 5px 16px;
  background: var(--bg-brand);
  color: var(--text-inverse);
}

.message-story__viewer {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--bg-media) 94%, transparent);
  padding: 24px;
  backdrop-filter: blur(14px);
}

.message-story__stage {
  position: relative;
  display: flex;
  max-width: calc(100vw - 48px);
  max-height: calc(100dvh - 48px);
  overflow: hidden;
  border: 1px solid var(--border-media);
  border-radius: 18px;
  background: var(--bg-media);
  box-shadow: var(--shadow-xl);
}

.message-story__stage--portrait {
  width: min(430px, calc(100vw - 48px));
  height: min(86dvh, 760px);
}

.message-story__stage--landscape {
  width: min(900px, calc(100vw - 48px));
  aspect-ratio: 16 / 10;
}

.message-story__stage--square {
  width: min(680px, calc(100vw - 48px));
  aspect-ratio: 1;
}

.message-story__header {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px;
  background: linear-gradient(to bottom, color-mix(in srgb, var(--bg-media) 86%, transparent), transparent);
  color: var(--text-media);
}

.message-story__header div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.message-story__header strong,
.message-story__header span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-story__header strong {
  font-size: 14px;
}

.message-story__header span {
  color: var(--text-media-muted);
  font-size: 11px;
}

.message-story__viewer-media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: var(--bg-media);
}

.message-story__caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 48px 20px 20px;
  background: linear-gradient(to top, color-mix(in srgb, var(--bg-media) 90%, transparent), transparent);
  color: var(--text-media);
  font-size: 13px;
  line-height: 1.55;
}

.message-story__close {
  position: fixed;
  z-index: 3;
  top: max(18px, env(safe-area-inset-top));
  right: max(18px, env(safe-area-inset-right));
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-media);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-media) 68%, transparent);
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.message-story-viewer-enter-active,
.message-story-viewer-leave-active {
  transition: opacity 0.15s ease;
}

.message-story-viewer-enter-from,
.message-story-viewer-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .message-story__reply-label {
    max-width: calc(100vw - 92px);
    font-size: 12px;
  }

  .message-story--portrait .message-story__media-card {
    width: min(240px, calc(100vw - 92px));
  }

  .message-story--landscape .message-story__media-card {
    width: min(320px, calc(100vw - 92px));
  }

  .message-story--square .message-story__media-card {
    width: min(270px, calc(100vw - 92px));
  }

  .message-story__viewer {
    align-items: stretch;
    padding: 0;
  }

  .message-story__stage,
  .message-story__stage--portrait,
  .message-story__stage--landscape,
  .message-story__stage--square {
    width: 100%;
    height: 100dvh;
    max-width: none;
    max-height: none;
    aspect-ratio: auto;
    border: 0;
    border-radius: 0;
  }
}
</style>
