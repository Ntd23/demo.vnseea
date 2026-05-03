<!-- Description: Renders the watch page as a content-first player and related-video layout that matches the PHP watch page order. -->
<template>
  <div class="space-y-5 pb-10">
    <section class="rounded-[26px] border border-[#dbe3f2] bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,35,110,0.06)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ $t("pages.watchPage.heroEyebrow") }}
          </p>
          <h1 class="text-[1.9rem] font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]">
            {{ $t("pages.watchPage.heroTitle") }}
          </h1>
          <p class="max-w-3xl text-[14px] leading-7 text-slate-500">
            {{ $t("pages.watchPage.heroDescription") }}
          </p>
        </div>
      </div>
    </section>

    <WatchFilters
      :search="searchQuery"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      @update:search="searchQuery = $event"
    />

    <div v-if="selectedVideo" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
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
import WatchPlayer from "../components/WatchPlayer.vue"
import WatchVideoInfo from "../components/WatchVideoInfo.vue"
import type { WatchCategoryKey, WatchComment, WatchVideo } from "../../application/composables/useMockWatchData"
import { useMockWatchData } from "../../application/composables/useMockWatchData"

const { t: translate } = useI18n()
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
