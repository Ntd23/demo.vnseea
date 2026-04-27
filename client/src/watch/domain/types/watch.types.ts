export type WatchCategoryKey = "all" | "community" | "education" | "business" | "events" | "technology"

export interface WatchComment {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
}

export interface WatchVideo {
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

export interface WatchCategoryOption {
  label: string
  value: WatchCategoryKey
  icon: string
}

export interface WatchHeroStat {
  label: string
  value: string | number
  description: string
}
