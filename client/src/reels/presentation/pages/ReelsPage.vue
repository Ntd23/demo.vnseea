<!-- Description: Renders the reels route as a minimal fullscreen media viewer backed by real feed videos instead of a dashboard-style landing page. -->
<template>
  <div class="min-h-screen bg-[#020617] text-white">
    <div v-if="loading" class="flex min-h-screen items-center justify-center px-6 text-center">
      <div class="space-y-4 rounded-[28px] border border-white/10 bg-white/6 px-8 py-10 backdrop-blur">
        <Icon name="i-lucide-loader-2" class="mx-auto h-8 w-8 animate-spin text-white/70" />
        <p class="text-sm font-bold text-white/70">{{ t("pages.reelsPage.playing") }}</p>
      </div>
    </div>

    <div v-else-if="activeReel" class="relative flex min-h-screen items-center justify-center overflow-hidden">
      <button
        type="button"
        class="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 p-3 text-white backdrop-blur transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="reels.length < 2"
        @click="prevReel"
      >
        <Icon name="i-ph-caret-up-bold" class="h-5 w-5 rotate-[-90deg]" />
      </button>

      <div
        class="relative h-screen w-full max-w-[480px] overflow-hidden bg-black sm:my-4 sm:h-[92vh] sm:rounded-[32px] sm:border sm:border-white/10"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <template v-if="activeMedia?.type === 'video'">
          <video
            :key="activeReel.id"
            :src="activeMedia.src"
            class="h-full w-full object-cover"
            autoplay
            loop
            playsinline
            muted
          />
        </template>
        <img
          v-else
          :src="activeMedia?.thumb || activeMedia?.src || activeReel.authorAvatarUrl"
          :alt="activeReel.author"
          class="h-full w-full object-cover"
        >

        <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.15)_0%,transparent_28%,rgba(2,6,23,0.78)_100%)]" />

        <div class="absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-3 py-3">
          <div
            v-for="(item, index) in reels"
            :key="item.id"
            class="h-[3px] flex-1 rounded-full"
            :class="index === activeIndex ? 'bg-white' : 'bg-white/30'"
          />
        </div>

        <div class="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <div class="flex items-center gap-3">
            <img
              :src="activeReel.authorAvatarUrl"
              :alt="activeReel.author"
              class="h-11 w-11 rounded-full border-2 border-white/80 object-cover"
            >
            <div class="min-w-0">
              <p class="truncate text-[14px] font-bold text-white">
                {{ activeReel.author }}
              </p>
              <p class="truncate text-[12px] text-white/70">
                {{ activeReel.time }}
              </p>
            </div>
          </div>

          <p v-if="activeReel.text" class="mt-3 text-[14px] leading-6 text-white/90">
            {{ activeReel.text }}
          </p>

          <div class="mt-4 flex items-center gap-3 text-[12px] font-semibold text-white/78">
            <span>{{ activeReel.stats.likes }} {{ t("pages.reelsPage.like") }}</span>
            <span>{{ activeReel.stats.comments }} {{ t("pages.reelsPage.comment") }}</span>
            <span>{{ activeReel.stats.shares }} {{ t("pages.reelsPage.share") }}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/35 p-3 text-white backdrop-blur transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="reels.length < 2"
        @click="nextReel"
      >
        <Icon name="i-ph-caret-down-bold" class="h-5 w-5 rotate-[-90deg]" />
      </button>
    </div>

    <div v-else class="flex min-h-screen items-center justify-center px-6 text-center">
      <div class="space-y-4 rounded-[28px] border border-white/10 bg-white/6 px-8 py-10 backdrop-blur">
        <Icon name="i-ph-film-strip-duotone" class="mx-auto h-8 w-8 text-white/70" />
        <p class="text-base font-black text-white">{{ t("pages.reelsPage.heroTitle") }}</p>
        <p class="max-w-md text-sm leading-6 text-white/70">{{ errorMessage || t("pages.watchPage.emptyDescription") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useReelsPageVM } from "../../application/view-models/useReelsPageVM"

const { t } = useI18n()
const {
  loading,
  errorMessage,
  reels,
  activeIndex,
  activeReel,
  activeMedia,
  fetchReels,
  nextReel,
  prevReel,
  onTouchStart,
  onTouchEnd,
} = useReelsPageVM()

useSeoMeta({
  title: () => t("pages.reelsPage.seoTitle"),
  description: () => t("pages.reelsPage.seoDescription"),
})

await fetchReels()
</script>
