<template>
  <div class="relative h-full min-h-0 overflow-hidden bg-[linear-gradient(180deg,#05070d_0%,#0f1724_52%,#05070d_100%)] text-white">
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.10),transparent_28%,transparent_72%,rgba(37,99,235,0.12))]" />

    <div class="relative flex h-full min-h-0 w-full items-center justify-center px-0 py-0 sm:px-5 sm:py-4 xl:px-8">
      <ReelsPlayer
        :reel="activeReel"
        :current-index="activeIndex"
        :total="reels.length"
        @next="nextReel"
        @prev="prevReel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReelsPage } from "../../application/composables/useReelsPage"
import ReelsPlayer from "../components/ReelsPlayer.vue"

const {
  activeIndex,
  activeReel,
  reels,
  nextReel,
  prevReel,
} = useReelsPage()
</script>
