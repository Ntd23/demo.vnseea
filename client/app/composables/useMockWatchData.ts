export type WatchCategoryKey = "all" | "community" | "education" | "business" | "events" | "technology"

export type WatchComment = {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
}

export type WatchVideo = {
  id: string
  title: string
  category: Exclude<WatchCategoryKey, "all">
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  date: string
  duration: string
  views: number
  likes: number
  shares: number
  cover: string
  description: string
  tags: string[]
  comments: WatchComment[]
}

export const useMockWatchData = () => {
  const { tm } = useI18n()

  const categories = computed(() => tm("pages.watchPage.categories") as { label: string; value: WatchCategoryKey; icon: string }[])
  const videos = computed(() => tm("pages.watchPage.videos") as WatchVideo[])

  return {
    categories,
    videos,
    findVideoById: (id: string) => videos.value.find(video => video.id === id),
  }
}

export const formatWatchNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
