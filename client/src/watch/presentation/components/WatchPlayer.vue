<!-- Description: Renders the selected watch item hero using API-backed video metadata from the normalized feed posts. -->
<template>
  <section class="watch-player">
    <div class="watch-player__video">
      <NuxtImg
        :alt="video.title"
        class="watch-player__img"
        :src="video.cover"
        loading="lazy"
        format="webp"
      />
      <div class="watch-player__overlay" />

      <!-- Top badges -->
      <div class="watch-player__badges">
        <span class="watch-player__badge">{{ video.categoryLabel }}</span>
        <span class="watch-player__badge">{{ video.duration }}</span>
      </div>

      <!-- Play button -->
      <button
        class="watch-player__play-btn"
        type="button"
        @click="$emit('togglePlay')"
      >
        <Icon
          :name="playing ? 'i-ph-pause-fill' : 'i-ph-play-fill'"
          class="watch-player__play-icon"
          :class="{ 'watch-player__play-icon--play': !playing }"
        />
      </button>

      <!-- Controls bar -->
      <div class="watch-player__controls">
        <div class="watch-player__progress-rail" @click="noop">
          <div class="watch-player__progress-fill" :style="{ width: `${progress}%` }" />
        </div>
        <div class="watch-player__time-row">
          <span class="watch-player__time">{{ elapsed }}</span>
          <span class="watch-player__ready">{{ $t("pages.watchPage.playerReady") }}</span>
          <span class="watch-player__time">{{ video.duration }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchVideo } from "../../application/composables/useWatchData"

defineProps<{
  video: WatchVideo
  playing: boolean
  progress: number
  elapsed: string
}>()

defineEmits<{ togglePlay: [] }>()

const noop = () => {}
</script>

<style scoped>
.watch-player {
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--border-media);
  background: var(--bg-media);
  color: var(--text-media);
  box-shadow: var(--shadow-lg);
}

.watch-player__video {
  position: relative;
  aspect-ratio: 16/9;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 640px) {
  .watch-player__video { min-height: 320px; }
}

.watch-player__img {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 700ms ease;
}

.watch-player__img:hover {
  transform: scale(1.05);
}

.watch-player__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--bg-media) 90%, transparent),
    color-mix(in srgb, var(--bg-media) 10%, transparent),
    color-mix(in srgb, var(--bg-media) 5%, transparent)
  );
}

/* Badges */
.watch-player__badges {
  position: absolute;
  left: 16px;
  top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.watch-player__badge {
  border-radius: 999px;
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--bg-media) 40%, transparent);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-media);
  backdrop-filter: blur(8px);
}

/* Play button */
.watch-player__play-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--border-media);
  background: color-mix(in srgb, var(--text-media) 18%, transparent);
  color: var(--text-media);
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-lg);
  transition: all 0.25s ease;
}

.watch-player__play-btn:hover {
  background: color-mix(in srgb, var(--text-media) 28%, transparent);
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 12px 40px color-mix(in srgb, var(--bg-brand) 20%, transparent);
}

.watch-player__play-icon {
  width: 40px;
  height: 40px;
}

.watch-player__play-icon--play {
  transform: translateX(2px);
}

/* Controls */
.watch-player__controls {
  position: absolute;
  inset-x: 0;
  bottom: 0;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.watch-player__progress-rail {
  position: relative;
  height: 6px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-media) 20%, transparent);
}

.watch-player__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--bg-brand);
  box-shadow: 0 0 10px color-mix(in srgb, var(--bg-brand) 50%, transparent);
  transition: width 0.3s ease;
}

.watch-player__time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.watch-player__time {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-media-muted);
  font-variant-numeric: tabular-nums;
}

.watch-player__ready {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--text-media) 45%, transparent);
  user-select: none;
}
</style>
