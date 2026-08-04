<!-- Description: Renders a compact app-style voice message player with a waveform and synchronized playback progress. -->
<template>
  <div class="voice-message-card">
    <div class="voice-message-card__label">
      <Icon name="i-ph-music-note-fill" aria-hidden="true" />
      <span>{{ t("pages.messagesPage.voiceMessage") }}</span>
    </div>

    <div class="voice-message-card__controls">
      <button
        type="button"
        class="voice-message-card__play"
        :class="{ 'voice-message-card__play--error': playbackFailed }"
        :title="t(isPlaying ? 'pages.messagesPage.voicePause' : 'pages.messagesPage.voicePlay')"
        :aria-label="t(isPlaying ? 'pages.messagesPage.voicePause' : 'pages.messagesPage.voicePlay')"
        @click.stop="togglePlayback"
      >
        <Icon :name="isPlaying ? 'i-ph-pause-fill' : 'i-ph-play-fill'" />
      </button>

      <div class="voice-message-card__body">
        <button
          type="button"
          class="voice-message-card__waveform"
          :aria-label="t('pages.messagesPage.voiceSeek')"
          @click.stop="seekPlayback"
        >
          <span
            v-for="(height, index) in waveform"
            :key="index"
            class="voice-message-card__bar"
            :class="{ 'voice-message-card__bar--played': index / waveform.length <= progress }"
            :style="{ height: `${height}px` }"
          />
        </button>
        <span class="voice-message-card__time" :class="{ 'voice-message-card__time--error': playbackFailed }">
          {{ playbackFailed ? t("pages.messagesPage.voicePlaybackError") : formattedTime }}
        </span>
      </div>
    </div>

    <audio
      ref="audioElement"
      :src="src"
      preload="metadata"
      @loadedmetadata="syncDuration"
      @durationchange="syncDuration"
      @timeupdate="syncCurrentTime"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="handleEnded"
      @canplay="playbackFailed = false"
      @error="handlePlaybackError"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"

const props = defineProps<{ src: string }>()
const { t } = useI18n()
const audioElement = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const playbackFailed = ref(false)
const waveform = [14, 25, 34, 22, 31, 18, 28, 38, 24, 31, 17, 26, 36, 20, 29, 40, 23, 32, 18, 27, 35, 21]

const progress = computed(() => duration.value > 0
  ? Math.min(Math.max(currentTime.value / duration.value, 0), 1)
  : 0)

const formatTime = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(Math.floor(seconds), 0) : 0
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`
}

const formattedTime = computed(() => formatTime(isPlaying.value || currentTime.value > 0
  ? currentTime.value
  : duration.value))

const syncDuration = () => {
  const nextDuration = audioElement.value?.duration ?? 0
  duration.value = Number.isFinite(nextDuration) ? nextDuration : 0
}

const syncCurrentTime = () => {
  currentTime.value = audioElement.value?.currentTime ?? 0
}

const togglePlayback = async () => {
  const audio = audioElement.value
  if (!audio) return
  if (audio.paused) {
    playbackFailed.value = false
    try {
      await audio.play()
    }
    catch {
      playbackFailed.value = true
      isPlaying.value = false
    }
    return
  }
  audio.pause()
}

const seekPlayback = (event: MouseEvent) => {
  const audio = audioElement.value
  if (!audio || duration.value <= 0) return
  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  const ratio = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1)
  audio.currentTime = ratio * duration.value
  syncCurrentTime()
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const handlePlaybackError = () => {
  playbackFailed.value = true
  isPlaying.value = false
}

watch(() => props.src, () => {
  const audio = audioElement.value
  audio?.pause()
  currentTime.value = 0
  duration.value = 0
  isPlaying.value = false
  playbackFailed.value = false
  audio?.load()
})

onBeforeUnmount(() => audioElement.value?.pause())
</script>

<style scoped>
.voice-message-card { width: min(330px, 100%); min-width: 230px; border: 1px solid var(--border-light); border-radius: 18px; background: var(--bg-surface); padding: 11px 13px 12px; color: var(--text-primary); box-shadow: var(--shadow-sm); }
.voice-message-card__label { display: flex; align-items: center; gap: 7px; margin: 0 0 5px 62px; color: var(--text-secondary); font-size: 13px; font-weight: 650; }
.voice-message-card__label svg { width: 17px; height: 17px; }
.voice-message-card__controls { display: flex; align-items: center; gap: 11px; }
.voice-message-card__play { display: grid; width: 50px; height: 50px; flex: 0 0 50px; place-items: center; border: 0; border-radius: 50%; background: linear-gradient(135deg, var(--bg-brand-hover), var(--bg-brand)); color: var(--text-inverse); cursor: pointer; box-shadow: var(--shadow-brand); }
.voice-message-card__play svg { width: 20px; height: 20px; }
.voice-message-card__play--error { background: var(--color-error-500, #dc2626); }
.voice-message-card__body { display: grid; min-width: 0; flex: 1; gap: 3px; }
.voice-message-card__waveform { display: flex; width: 100%; height: 40px; min-width: 0; align-items: center; gap: 3px; border: 0; background: transparent; padding: 0; cursor: pointer; }
.voice-message-card__bar { width: 4px; min-width: 2px; flex: 1; border-radius: 999px; background: var(--border-strong); transition: background 0.15s ease; }
.voice-message-card__bar--played { background: var(--bg-brand); }
.voice-message-card__time { color: var(--text-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }
.voice-message-card__time--error { color: var(--color-error-600, #dc2626); }
.voice-message-card audio { display: none; }

@media (max-width: 520px) {
  .voice-message-card { min-width: 210px; padding: 9px 11px 10px; }
  .voice-message-card__label { margin-left: 52px; font-size: 12px; }
  .voice-message-card__controls { gap: 9px; }
  .voice-message-card__play { width: 44px; height: 44px; flex-basis: 44px; }
  .voice-message-card__waveform { gap: 2px; }
}
</style>
