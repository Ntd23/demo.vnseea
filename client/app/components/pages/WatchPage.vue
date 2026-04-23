<template>
  <div class="space-y-4 pb-10 sm:space-y-5">
    <section class="sm:hidden surface-card p-5">
      <p class="text-micro font-bold uppercase tracking-[0.2em] text-primary-600">
        {{ t("pages.watchPage.heroEyebrow") }}
      </p>
      <h1 class="mt-2 text-3xl font-black leading-tight text-secondary-900">
        {{ t("pages.watchPage.heroTitle") }}
      </h1>
      <p class="mt-2 text-sm font-medium leading-relaxed text-secondary-500">
        {{ t("pages.watchPage.heroDescription") }}
      </p>

      <div class="scrollbar-hide -mx-1 mt-6 flex gap-3 overflow-x-auto pb-1 px-1">
        <div
          v-for="item in mobileHeroStats"
          :key="item.label"
          class="min-w-[140px] shrink-0 rounded-2xl bg-secondary-50/50 border border-secondary-100/50 px-4 py-3"
        >
          <p class="text-[10px] font-black uppercase tracking-wider text-secondary-400">{{ item.label }}</p>
          <p class="mt-1.5 text-xl font-black leading-none text-secondary-900">{{ item.value }}</p>
          <p class="mt-1 text-[11px] font-semibold text-secondary-500">{{ item.description }}</p>
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

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
  </div>
</template>

<script setup lang="ts">
import type { WatchCategoryKey, WatchComment, WatchVideo } from "~/composables/useMockWatchData"
import { formatWatchNumber } from "~/composables/useMockWatchData"

const { t, locale } = useI18n()
const { categories, videos } = useMockWatchData()
const { searchQuery, debouncedSearchQuery } = useDebouncedSearch()

useSeoMeta({
  title: () => t("pages.watchPage.seoTitle"),
  description: () => t("pages.watchPage.seoDescription"),
})

const selectedCategory = ref<WatchCategoryKey>("all")
const selectedVideoId = ref(videos.value[0]?.id ?? "")
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

watch(filteredVideos, (items) => {
  if (!items.some(video => video.id === selectedVideoId.value)) {
    selectedVideoId.value = items[0]?.id ?? videos.value[0]!.id
  }
})

const selectedVideo = computed<WatchVideo>(() => videos.value.find(video => video.id === selectedVideoId.value) ?? videos.value[0]!)

const activeComments = computed(() => [
  ...selectedVideo.value.comments,
  ...(localCommentsById.value[selectedVideo.value.id] ?? []),
])

const elapsed = computed(() => {
  const totalSeconds = parseDuration(selectedVideo.value.duration)
  const current = Math.round(totalSeconds * progress.value / 100)
  const minutes = Math.floor(current / 60).toString().padStart(2, "0")
  const seconds = (current % 60).toString().padStart(2, "0")
  return `${minutes}:${seconds}`
})

const heroStats = computed(() => [
  {
    label: t("pages.watchPage.statVideos"),
    value: videos.value.length,
    description: t("pages.watchPage.statVideosDescription"),
  },
  {
    label: t("pages.watchPage.statViews"),
    value: formatWatchNumber(videos.value.reduce((sum, video) => sum + video.views, 0), locale.value),
    description: t("pages.watchPage.statViewsDescription"),
  },
  {
    label: t("pages.watchPage.statComments"),
    value: Object.values(localCommentsById.value).reduce((sum, comments) => sum + comments.length, 0),
    description: t("pages.watchPage.statCommentsDescription"),
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
  selectedVideoId.value = id
  playing.value = false
  progress.value = 8
  shareMessage.value = ""
}

const togglePlay = () => {
  playing.value = !playing.value
}

const toggleLike = () => {
  const id = selectedVideo.value.id
  const liked = likedById.value[id] ?? false
  likedById.value = { ...likedById.value, [id]: !liked }
  localLikesById.value = {
    ...localLikesById.value,
    [id]: Math.max(0, (localLikesById.value[id] ?? 0) + (liked ? -1 : 1)),
  }
}

const shareVideo = () => {
  shareMessage.value = t("pages.watchPage.shareSuccess")
}

const sendComment = (message: string) => {
  const id = selectedVideo.value.id
  const comment: WatchComment = {
    id: Date.now(),
    author: t("pages.watchPage.you"),
    initials: t("pages.watchPage.youInitials"),
    role: t("pages.watchPage.viewerRole"),
    message,
    time: t("pages.watchPage.justNow"),
  }

  localCommentsById.value = {
    ...localCommentsById.value,
    [id]: [...(localCommentsById.value[id] ?? []), comment],
  }
}
</script>
