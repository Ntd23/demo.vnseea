import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

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
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed(() =>
    localized<{ label: string; value: WatchCategoryKey; icon: string }[]>("pages.watchPage.categories"),
  )
  const videos = computed(() => localized<WatchVideo[]>("pages.watchPage.videos"))

  return {
    categories,
    videos,
    findVideoById: (id: string) => videos.value.find(video => video.id === id),
  }
}

export const formatWatchNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
