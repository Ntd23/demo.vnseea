import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type PopularCategoryKey =
  | "all"
  | "community"
  | "product"
  | "business"
  | "design"
  | "technology"

export type PopularCategory = {
  label: string
  value: PopularCategoryKey
  icon: string
}

export type PopularComment = {
  id: number
  author: string
  role: string
  text: string
}

export type PopularPost = {
  id: string
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: {
    likes: number
    comments: number
    shares: number
  }
  media?: "double" | "single"
  comments: PopularComment[]
  category: Exclude<PopularCategoryKey, "all">
  trendLabel: string
}

export type PopularQuickLink = {
  title: string
  description: string
  to: string
  icon: string
  accent: string
}

export const useMockPopularData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed(() =>
    localized<PopularCategory[]>("pages.popularPage.categories"),
  )

  const posts = computed(() =>
    localized<PopularPost[]>("pages.popularPage.posts"),
  )

  const quickLinks = computed(() =>
    localized<PopularQuickLink[]>("pages.popularPage.quickLinks"),
  )

  return {
    categories,
    posts,
    quickLinks,
  }
}

export const getPopularPostScore = (
  post: Pick<PopularPost, "stats">,
) => post.stats.likes + post.stats.comments * 2 + post.stats.shares * 3

export const formatPopularNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
