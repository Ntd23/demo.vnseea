import { formatWatchNumber, parseWatchDuration, videoMatchesKeyword } from "../../domain/services/watch-format.service"
import type { WatchCategoryKey, WatchComment, WatchVideo } from "../../domain/types/watch.types"
import { useWatchDataSource } from "../../infrastructure/adapters/watchData.adapter"

export function useWatchPage() {
  const { t: translate, locale } = useI18n()
  const { categories, videos } = useWatchDataSource()
  const { searchQuery, debouncedSearchQuery } = useDebouncedSearch()

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
      const matchesKeyword = videoMatchesKeyword(video, keyword)
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

    const totalSeconds = parseWatchDuration(video.duration)
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

  return {
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
  }
}
