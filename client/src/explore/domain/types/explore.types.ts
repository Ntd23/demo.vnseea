export type ExploreView = "all" | "posts" | "users" | "pages"

export type ExploreSectionKind = Exclude<ExploreView, "all">

export interface ExploreViewOption {
  label: string
  value: ExploreView
  icon: string
  description: string
}

export interface ExploreSummaryCard {
  label: string
  value: string
  description: string
  icon: string
}

export interface ExploreUserSpotlight {
  id: string
  name: string
  initials: string
  role: string
  href: string
  mutualLabel: string
  meta: string
  reason: string
  tags: string[]
  accent: string
  online?: boolean
}

export interface ExploreHashtag {
  slug: string
  label: string
  score: number
  to: string
}

export interface ExploreSection {
  kind: ExploreSectionKind
  label: string
  shortLabel: string
  description: string
  countLabel: string
}

export interface ExploreContentCounts {
  posts: number
  users: number
  pages: number
}
