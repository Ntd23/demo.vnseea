export type PopularCategoryKey =
  | "all"
  | "community"
  | "product"
  | "business"
  | "design"
  | "technology"

export interface PopularCategory {
  label: string
  value: PopularCategoryKey
  icon: string
}

export interface PopularComment {
  id: number
  author: string
  role: string
  text: string
}

export interface PopularPost {
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

export interface PopularQuickLink {
  title: string
  description: string
  to: string
  icon: string
  accent: string
}

export interface PopularSummaryCard {
  label: string
  value: string | number
  description: string
}

export interface PopularHashtagSummary {
  label: string
  score: string
  to: string
}

export interface PopularCreatorSummary {
  name: string
  initials: string
  role: string
  score: string
  accent: string
}
