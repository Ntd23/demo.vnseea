<template>
  <section class="overflow-hidden rounded-[30px] border border-[var(--border-default)] bg-[var(--color-secondary-900)] text-white shadow-[var(--shadow-xl)]">
    <div class="relative aspect-video min-h-[260px] overflow-hidden">
      <img :alt="video.title" class="absolute inset-0 h-full w-full object-cover" :src="video.cover">
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.76))]" />

      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <span class="rounded-[var(--radius-full)] bg-black/48 px-3 py-2 text-[12px] font-extrabold backdrop-blur">
          {{ video.categoryLabel }}
        </span>
        <span class="rounded-[var(--radius-full)] bg-black/48 px-3 py-2 text-[12px] font-extrabold backdrop-blur">
          {{ video.duration }}
        </span>
      </div>

      <button
        class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur transition hover:scale-105 hover:bg-white/24"
        type="button"
        @click="$emit('togglePlay')"
      >
        <Icon :name="playing ? 'i-ph-pause-fill' : 'i-ph-play-fill'" class="h-9 w-9" :class="playing ? '' : 'translate-x-0.5'" />
      </button>

      <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div class="h-1.5 overflow-hidden rounded-full bg-white/20">
          <div class="h-full rounded-full bg-[var(--color-primary-500)] transition-all" :style="{ width: `${progress}%` }" />
        </div>
        <div class="mt-3 flex items-center justify-between gap-3 text-[12px] font-bold text-white/78">
          <span>{{ elapsed }}</span>
          <span>Player mock · sẵn sàng thay bằng Plyr</span>
          <span>{{ video.duration }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchVideo } from "~/composables/useMockWatchData"

defineProps<{
  video: WatchVideo
  playing: boolean
  progress: number
  elapsed: string
}>()

defineEmits<{ togglePlay: [] }>()
</script>
