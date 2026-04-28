<template>
  <section class="overflow-hidden rounded-[30px] border border-secondary-800 bg-secondary-900 text-white shadow-2xl">
    <div class="relative aspect-video min-h-0 overflow-hidden sm:min-h-[320px]">
      <NuxtImg
        :alt="video.title"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        :src="video.cover"
        loading="lazy"
        format="webp"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-secondary-900/90 via-secondary-900/10 to-secondary-900/5" />

      <!-- Top Overlay -->
      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <span class="rounded-full bg-black/40 px-3 py-1.5 text-[12px] font-bold backdrop-blur-md border border-white/10 uppercase tracking-wider">
          {{ video.categoryLabel }}
        </span>
        <span class="rounded-full bg-black/40 px-3 py-1.5 text-[12px] font-bold backdrop-blur-md border border-white/10">
          {{ video.duration }}
        </span>
      </div>

      <!-- Play Button Overlay -->
      <button
        class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:bg-white/30 border border-white/30 shadow-xl"
        type="button"
        @click="$emit('togglePlay')"
      >
        <Icon 
          :name="playing ? 'i-ph-pause-fill' : 'i-ph-play-fill'" 
          class="h-10 w-10" 
          :class="{ 'translate-x-0.5': !playing }" 
        />
      </button>

      <!-- Bottom Player Controls (Simplified) -->
      <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6 space-y-3">
        <div class="group relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 sm:h-2">
          <div 
            class="h-full rounded-full bg-primary-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            :style="{ width: `${progress}%` }" 
          />
        </div>
        <div class="flex items-center justify-between gap-4 text-[12px] font-extrabold text-white/80 tracking-wide uppercase">
          <span class="tabular-nums">{{ elapsed }}</span>
          <span class="flex-1 text-center text-white/40 font-bold select-none">{{ $t("pages.watchPage.playerReady") }}</span>
          <span class="tabular-nums">{{ video.duration }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WatchVideo } from "../../application/composables/useMockWatchData"

defineProps<{
  video: WatchVideo
  playing: boolean
  progress: number
  elapsed: string
}>()

defineEmits<{ togglePlay: [] }>()
</script>
