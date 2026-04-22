<template>
  <div class="space-y-4 pb-10 sm:space-y-5">
    <section class="sm:hidden rounded-[28px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)]">
      <p class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-primary-600)]">
        {{ t("pages.watchPage.heroEyebrow") }}
      </p>
      <h1 class="mt-2 text-[1.85rem] font-black leading-[1.04] text-[var(--text-primary)]">
        {{ t("pages.watchPage.heroTitle") }}
      </h1>
      <p class="mt-2 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">
        {{ t("pages.watchPage.heroDescription") }}
      </p>

      <div class="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
        <div
          v-for="item in mobileHeroStats"
          :key="item.label"
          class="min-w-[132px] shrink-0 rounded-[20px] bg-[var(--bg-surface-hover)] px-3.5 py-3"
        >
          <p class="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{{ item.label }}</p>
          <p class="mt-1.5 text-[1.3rem] font-black leading-none text-[var(--text-primary)]">{{ item.value }}</p>
          <p class="mt-1 text-[11px] font-semibold text-[var(--text-secondary)]">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <div class="hidden sm:block">
      <WatchHero :stats="heroStats" />
    </div>

    <WatchFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main class="space-y-5">
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

useSeoMeta({
  title: () => t("pages.watchPage.seoTitle"),
  description: () => t("pages.watchPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<WatchCategoryKey>("all")
const selectedVideoId = ref(videos.value[0]?.id ?? "")
const playing = ref(false)
const progress = ref(28)
const localLikesById = ref<Record<string, number>>({})
const likedById = ref<Record<string, boolean>>({})
const localCommentsById = ref<Record<string, WatchComment[]>>({})
const shareMessage = ref("")

const filteredVideos = computed(() => {
  const keyword = search.value.trim().toLowerCase()

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
