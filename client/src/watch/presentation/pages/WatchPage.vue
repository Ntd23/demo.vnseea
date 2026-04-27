<template>
  <div class="space-y-4 pb-10 sm:space-y-5">
    <section class="sm:hidden surface-card p-5">
      <p class="text-micro font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">
        {{ $t("pages.watchPage.heroEyebrow") }}
      </p>
      <h1 class="mt-2 text-3xl font-black leading-tight text-[var(--text-primary)]">
        {{ $t("pages.watchPage.heroTitle") }}
      </h1>
      <p class="mt-2 text-sm font-medium leading-relaxed text-[var(--text-primary)]">
        {{ $t("pages.watchPage.heroDescription") }}
      </p>

      <div class="scrollbar-hide -mx-1 mt-6 flex gap-3 overflow-x-auto pb-1 px-1">
        <div
          v-for="item in mobileHeroStats"
          :key="item.label"
          class="min-w-[140px] shrink-0 rounded-2xl bg-secondary-50/50 border border-secondary-100/50 px-4 py-3"
        >
          <p class="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">{{ item.label }}</p>
          <p class="mt-1.5 text-xl font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
          <p class="mt-1 text-[11px] font-semibold text-[var(--text-primary)]">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <div class="hidden sm:block">
      <WatchHero :stats="heroStats" />
    </div>

    <WatchFilters
      :search="searchQuery"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      @update:search="searchQuery = $event"
    />

    <div v-if="selectedVideo" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <main class="space-y-6">
        <WatchPlayer
          :elapsed="elapsed"
          :playing="playing"
          :progress="progress"
          :video="selectedVideo"
          @toggle-play="togglePlay"
        />

        <WatchVideoInfo
          :liked="likedById[selectedVideo.id] ?? false"
          :local-likes="localLikesById[selectedVideo.id] ?? 0"
          :share-message="shareMessage"
          :video="selectedVideo"
          @like="toggleLike"
          @share="shareVideo"
        />

        <WatchComments
          :comments="activeComments"
          @send="sendComment"
        />
      </main>

      <WatchRelatedVideos
        :selected-id="selectedVideoId"
        :videos="filteredVideos"
        @select="selectVideo"
      />
    </div>

    <section v-else class="surface-card p-6 sm:p-8">
      <div class="max-w-xl space-y-3">
        <p class="text-label-primary text-[var(--text-primary)] uppercase tracking-widest">
          {{ $t("pages.watchPage.emptyEyebrow") }}
        </p>
        <h2 class="text-heading text-[var(--text-primary)]">
          {{ $t("pages.watchPage.emptyTitle") }}
        </h2>
        <p class="text-body-secondary leading-relaxed text-[var(--text-primary)]">
          {{ $t("pages.watchPage.emptyDescription") }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useWatchPage } from "../../application/composables/useWatchPage"
import WatchComments from "../components/WatchComments.vue"
import WatchFilters from "../components/WatchFilters.vue"
import WatchHero from "../components/WatchHero.vue"
import WatchPlayer from "../components/WatchPlayer.vue"
import WatchRelatedVideos from "../components/RelatedVideos.vue"
import WatchVideoInfo from "../components/WatchVideoInfo.vue"

const {
  activeComments,
  categories,
  elapsed,
  filteredVideos,
  heroStats,
  likedById,
  localLikesById,
  mobileHeroStats,
  playing,
  progress,
  searchQuery,
  selectedCategory,
  selectedVideo,
  selectedVideoId,
  shareMessage,
  selectVideo,
  sendComment,
  shareVideo,
  toggleLike,
  togglePlay,
} = useWatchPage()
</script>
