<template>
  <div class="space-y-4 pb-10 sm:space-y-5">
    <section class="sm:hidden watch-mobile-hero">
      <p class="watch-mobile-hero__eyebrow">
        {{ $t("pages.watchPage.heroEyebrow") }}
      </p>
      <h1 class="watch-mobile-hero__title">
        {{ $t("pages.watchPage.heroTitle") }}
      </h1>
      <p class="watch-mobile-hero__desc">
        {{ $t("pages.watchPage.heroDescription") }}
      </p>

      <div class="watch-mobile-stats">
        <div
          v-for="item in mobileHeroStats"
          :key="item.label"
          class="watch-mobile-stat"
        >
          <p class="watch-mobile-stat__label">{{ item.label }}</p>
          <p class="watch-mobile-stat__value">{{ item.value }}</p>
          <p class="watch-mobile-stat__desc">{{ item.description }}</p>
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
        <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
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
import WatchRelatedVideos from "../components/RelatedVideos.vue"
import WatchComments from "../components/WatchComments.vue"
import WatchFilters from "../components/WatchFilters.vue"
import WatchHero from "../components/WatchHero.vue"
import WatchPlayer from "../components/WatchPlayer.vue"
import WatchVideoInfo from "../components/WatchVideoInfo.vue"
import type { WatchCategoryKey, WatchComment, WatchVideo } from "../../application/composables/useMockWatchData"
import { formatWatchNumber, useMockWatchData } from "../../application/composables/useMockWatchData"

const { t: translate, locale } = useI18n()
const { categories, videos } = useMockWatchData()
const { searchQuery, debouncedSearchQuery } = useDebouncedSearch()

useSeoMeta({
  title: () => translate("pages.watchPage.seoTitle"),
  description: () => translate("pages.watchPage.seoDescription"),
})

const selectedCategory = ref<WatchCategoryKey>("all")
const selectedVideoId = ref("")
const playing = ref(false)
const progress = ref(28)
const localLikesById = ref<Record<string, number>>({})
const likedById = ref<Record<string, boolean>>({})
const localCommentsById = ref<Record<string, WatchComment[]>>({})
const shareMessage = ref("")

const filteredVideos = computed(() => {
  const keyword = debouncedSearchQuery.value.trim().toLowerCase()

  return videos.value.filter((video) => {
    const matchesKeyword = keyword.length === 0 || [
      video.title,
      video.author,
      video.categoryLabel,
      video.description,
      ...video.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory = selectedCategory.value === "all" || video.category === selectedCategory.value
    return matchesKeyword && matchesCategory
  })
})

watch([videos, filteredVideos], ([allVideos, items]) => {
  const fallbackId = items[0]?.id ?? allVideos[0]?.id ?? ""
  if (!items.some(video => video.id === selectedVideoId.value)) {
    selectedVideoId.value = fallbackId
  }
}, { immediate: true })

const selectedVideo = computed<WatchVideo | null>(() =>
  videos.value.find(video => video.id === selectedVideoId.value) ?? videos.value[0] ?? null,
)

const activeComments = computed(() => {
  const video = selectedVideo.value
  if (!video) return []

  return [
    ...video.comments,
    ...(localCommentsById.value[video.id] ?? []),
  ]
})

const elapsed = computed(() => {
  const video = selectedVideo.value
  if (!video) return "00:00"

  const totalSeconds = parseDuration(video.duration)
  const current = Math.round(totalSeconds * progress.value / 100)
  const minutes = Math.floor(current / 60).toString().padStart(2, "0")
  const seconds = (current % 60).toString().padStart(2, "0")
  return `${minutes}:${seconds}`
})

const heroStats = computed(() => [
  {
    label: translate("pages.watchPage.statVideos"),
    value: videos.value.length,
    description: translate("pages.watchPage.statVideosDescription"),
  },
  {
    label: translate("pages.watchPage.statViews"),
    value: formatWatchNumber(videos.value.reduce((sum, video) => sum + video.views, 0), locale.value),
    description: translate("pages.watchPage.statViewsDescription"),
  },
  {
    label: translate("pages.watchPage.statComments"),
    value: Object.values(localCommentsById.value).reduce((sum, comments) => sum + comments.length, 0),
    description: translate("pages.watchPage.statCommentsDescription"),
  },
])

const mobileHeroStats = computed(() => heroStats.value.slice(0, 3))

let progressTimer: ReturnType<typeof setInterval> | undefined

watch(playing, (isPlaying) => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = undefined
  }

  if (isPlaying) {
    progressTimer = setInterval(() => {
      progress.value = progress.value >= 98 ? 8 : progress.value + 1
    }, 900)
  }
})

onBeforeUnmount(() => {
  if (progressTimer) clearInterval(progressTimer)
})

const parseDuration = (duration: string) => {
  const [minutes = "0", seconds = "0"] = duration.split(":")
  return Number(minutes) * 60 + Number(seconds)
}

const selectVideo = (id: string) => {
  if (!videos.value.some(video => video.id === id)) return

  selectedVideoId.value = id
  playing.value = false
  progress.value = 8
  shareMessage.value = ""
}

const togglePlay = () => {
  playing.value = !playing.value
}

const toggleLike = () => {
  const video = selectedVideo.value
  if (!video) return

  const id = video.id
  const liked = likedById.value[id] ?? false
  likedById.value = { ...likedById.value, [id]: !liked }
  localLikesById.value = {
    ...localLikesById.value,
    [id]: Math.max(0, (localLikesById.value[id] ?? 0) + (liked ? -1 : 1)),
  }
}

const shareVideo = () => {
  if (!selectedVideo.value) return
  shareMessage.value = translate("pages.watchPage.shareSuccess")
}

const sendComment = (message: string) => {
  const video = selectedVideo.value
  if (!video) return

  const id = video.id
  const comment: WatchComment = {
    id: Date.now(),
    author: translate("pages.watchPage.you"),
    initials: translate("pages.watchPage.youInitials"),
    role: translate("pages.watchPage.viewerRole"),
    message,
    time: translate("pages.watchPage.justNow"),
  }

  localCommentsById.value = {
    ...localCommentsById.value,
    [id]: [...(localCommentsById.value[id] ?? []), comment],
  }
}
</script>

<style scoped>
.watch-mobile-hero {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 255, 0.04);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.watch-mobile-hero__eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.watch-mobile-hero__title {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.watch-mobile-hero__desc {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  color: #64748b;
}

.watch-mobile-stats {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 12px 0 4px;
  scrollbar-width: none;
}

.watch-mobile-stats::-webkit-scrollbar {
  display: none;
}

.watch-mobile-stat {
  min-width: 130px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(0, 0, 255, 0.03);
  border: 1px solid rgba(0, 0, 255, 0.06);
  padding: 12px 14px;
}

.watch-mobile-stat__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.watch-mobile-stat__value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
  margin-top: 4px;
}

.watch-mobile-stat__desc {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  margin-top: 2px;
}
</style>
