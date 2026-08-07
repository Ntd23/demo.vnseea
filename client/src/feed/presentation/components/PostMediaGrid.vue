<!-- Description: Renders feed post media in a stable Facebook-style gallery grid for one or many backend media items. -->
<template>
  <div class="media-grid" :class="gridClass">
    <template v-for="(item, index) in visibleItems" :key="`${item.src}-${index}`">
      <button
        v-if="item.type === 'image'"
        class="media-grid__item"
        :class="`media-grid__item--slot-${index + 1}`"
        type="button"
        :aria-label="t('feed.postMediaGrid.openLabel', { index: index + 1 })"
        @click="emit('open', index)"
      >
        <img
          :src="item.src"
          :alt="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
          class="media-grid__img"
          loading="lazy"
          decoding="async"
        >
        <span v-if="isMoreSlot(index)" class="media-grid__more">
          +{{ hiddenCount }}
        </span>
      </button>

      <div
        v-else
        class="media-grid__item media-grid__item--video"
        :class="`media-grid__item--slot-${index + 1}`"
      >
        <video
          ref="videoRefs"
          :aria-label="item.alt || t('feed.postMediaGrid.label', { index: index + 1 })"
          class="media-grid__img media-grid__video"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          @loadedmetadata="handleVideoLoadedMetadata"
        >
          <source :src="item.src" :type="item.mime || 'video/mp4'">
        </video>
        <button
          class="media-grid__video-opener"
          type="button"
          :aria-label="t('pages.reelsPage.playing')"
          @click.stop.prevent="openVideoInReels"
        />
        <button
          class="media-grid__sound-toggle"
          type="button"
          :aria-label="isMuted ? t('feed.postMediaGrid.unmute') : t('feed.postMediaGrid.mute')"
          :aria-pressed="!isMuted"
          :title="isMuted ? t('feed.postMediaGrid.unmute') : t('feed.postMediaGrid.mute')"
          @click.stop.prevent="toggleVideoSound($event)"
        >
          <UIcon :name="isMuted ? 'i-ph-speaker-slash-fill' : 'i-ph-speaker-high-fill'" />
        </button>
        <button
          v-if="isMoreSlot(index)"
          class="media-grid__more media-grid__more--button"
          type="button"
          :aria-label="t('feed.postMediaGrid.openLabel', { index: index + 1 })"
          @click="emit('open', index)"
        >
          +{{ hiddenCount }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useReelsViewerOverlay } from "../../../reels/application/composables/useReelsViewerOverlay"
import { useFeedVideoSound } from "../../application/composables/useFeedVideoSound"
import type { FeedPostRecord } from "../../domain/types/feed.types"

const { t } = useI18n()
const videoRefs = ref<HTMLVideoElement[]>([])
const { open: openReelsViewer } = useReelsViewerOverlay()
const { isMuted, activateVideo, deactivateVideo, toggleSound } = useFeedVideoSound()

const props = defineProps<{
  items: Array<{
    type: "image" | "video"
    src: string
    alt?: string
    mime?: string
  }>
  post: FeedPostRecord
}>()

const emit = defineEmits<{ open: [index: number] }>()

const validItems = computed(() => props.items.filter(item => item.src))
const visibleLimit = computed(() => validItems.value.length >= 5 ? 5 : 4)
const visibleItems = computed(() => validItems.value.slice(0, visibleLimit.value))
const visibleCount = computed(() => visibleItems.value.length)
const hiddenCount = computed(() => Math.max(validItems.value.length - visibleItems.value.length, 0))
const singleItem = computed(() => visibleCount.value === 1 ? visibleItems.value[0] : undefined)
const singleVideoIsPortrait = ref(false)
const gridClass = computed(() => [
  `media-grid--count-${Math.min(Math.max(visibleCount.value, 1), 5)}`,
  singleItem.value?.type === "video" ? "media-grid--single-video" : "",
  singleVideoIsPortrait.value ? "media-grid--portrait" : "",
  hiddenCount.value > 0 ? "media-grid--has-more" : "",
])

watch(
  () => singleItem.value?.src,
  () => {
    singleVideoIsPortrait.value = false
  },
)

function isMoreSlot(index: number) {
  return hiddenCount.value > 0 && index === visibleItems.value.length - 1
}

function handleVideoLoadedMetadata(event: Event) {
  const video = event.currentTarget as HTMLVideoElement | null

  if (!video) return

  if (visibleCount.value === 1) {
    singleVideoIsPortrait.value = video.videoHeight > video.videoWidth
  }
}

function playVisibleVideo(video: HTMLVideoElement) {
  activateVideo(video)
  void video.play().catch(() => {
    // Browser autoplay rules can still require a user gesture.
  })
}

function toggleVideoSound(event: MouseEvent) {
  const button = event.currentTarget as HTMLButtonElement | null
  const video = button?.parentElement?.querySelector("video") as HTMLVideoElement | null

  if (!video) return

  toggleSound(video)

  if (!isMuted.value) {
    void video.play().catch(() => {
      // The click is a direct user gesture, but platform playback rules still win.
    })
  }
}

function openVideoInReels() {
  for (const video of videoRefs.value) {
    deactivateVideo(video)
  }

  openReelsViewer(props.post)
}

onMounted(() => {
  for (const video of videoRefs.value) {
    useIntersectionObserver(
      video,
      ([entry]) => {
        if (!entry) return

        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          playVisibleVideo(video)
          return
        }

        deactivateVideo(video)
      },
      {
        threshold: [0, 0.55, 1],
      },
    )
  }
})

onBeforeUnmount(() => {
  for (const video of videoRefs.value) {
    deactivateVideo(video)
  }
})
</script>

<style scoped>
.media-grid {
  display: grid;
  gap: 2px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--color-secondary-200);
}

.media-grid--count-1 {
  background: var(--bg-muted);
}

.media-grid--count-1.media-grid--single-video {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 0;
}

.media-grid--count-1.media-grid--single-video .media-grid__item {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  border-radius: 0;
  background: var(--bg-muted);
}

.media-grid--count-2,
.media-grid--count-4,
.media-grid--count-5 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  aspect-ratio: 16 / 9;
}

.media-grid--count-3 {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  grid-template-rows: repeat(2, minmax(0, 1fr));
  aspect-ratio: 16 / 9;
}

.media-grid--count-4 {
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.media-grid--count-5 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1.35fr) minmax(0, 1fr);
  aspect-ratio: 1.32 / 1;
}

.media-grid--count-3 .media-grid__item--slot-1 {
  grid-row: span 2;
}

.media-grid--count-5 .media-grid__item--slot-1,
.media-grid--count-5 .media-grid__item--slot-2 {
  grid-column: span 3;
}

.media-grid--count-5 .media-grid__item--slot-3,
.media-grid--count-5 .media-grid__item--slot-4,
.media-grid--count-5 .media-grid__item--slot-5 {
  grid-column: span 2;
}

.media-grid__item {
  position: relative;
  display: block;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: var(--color-secondary-900);
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.media-grid__item--video {
  cursor: default;
  background: #000000;;
}

.media-grid__img {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-secondary-900);
  object-fit: contain;
  object-position: center;
  transition: filter var(--duration-normal) var(--ease-default);
}

.media-grid--count-1 .media-grid__item {
  display: flex;
  max-height: 560px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
}

.media-grid--count-1 .media-grid__img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 560px;
  object-fit: contain;
}

.media-grid--count-1 .media-grid__item--video {
  display: block;
  width: 100%;
  height: 100%;
  background: #000000;;
}

.media-grid--count-1.media-grid--single-video .media-grid__video {
  position: absolute;
  inset: 0;
  display: block;
  min-width: 0;
  min-height: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  background: var(--bg-muted);
  object-fit: cover;
  object-position: center;
}

.media-grid--count-1.media-grid--single-video.media-grid--portrait .media-grid__video {
  object-fit: contain;
}

.media-grid__item:hover .media-grid__img {
  filter: brightness(0.96);
}

.media-grid__item--video:hover .media-grid__img,
.media-grid__video:hover {
  filter: none;
}

.media-grid__video {
  cursor: default;
}

.media-grid__video-opener {
  position: absolute;
  inset: 0;
  z-index: 7;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}

.media-grid__sound-toggle {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 10;
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  font-size: 21px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.24);
  cursor: pointer;
  touch-action: manipulation;
  backdrop-filter: blur(6px);
  transition: background var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default);
}

.media-grid__sound-toggle:hover {
  background: rgba(15, 23, 42, 0.9);
}

.media-grid__sound-toggle:active {
  transform: scale(0.94);
}

.media-grid__sound-toggle:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

.media-grid__more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: rgba(15, 23, 42, 0.62);
  color: #ffffff;
  font-size: clamp(28px, 7vw, 46px);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
  z-index: 8;
}

.media-grid__more--button {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

@media (max-width: 520px) {
  .media-grid__sound-toggle {
    right: 10px;
    bottom: 10px;
    width: 42px;
    height: 42px;
  }

  .media-grid--count-1.media-grid--single-video.media-grid--portrait {
    aspect-ratio: 4 / 5;
  }

  .media-grid--count-2,
  .media-grid--count-3,
  .media-grid--count-4 {
    aspect-ratio: 1 / 0.78;
  }

  .media-grid--count-5 {
    aspect-ratio: 1 / 0.86;
  }
}

</style>
