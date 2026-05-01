export type SearchResultType = "all" | "users" | "pages" | "groups" | "posts"
export type SearchCollectionType = Exclude<SearchResultType, "all">
export type SearchSortKey = "relevance" | "popular" | "recent"

export interface SearchOption<T extends string = string> {
  label: string
  value: T
}

export interface SearchTabItem {
  label: string
  value: SearchResultType
  icon: string
  description: string
}

export interface SearchResultItem {
  id: string
  kind: SearchCollectionType
  title: string
  subtitle: string
  description: string
  href: string
  initials: string
  badge?: string
  metricLabel: string
  metaLabel?: string
  tags: string[]
  searchableText: string
  accent: string
  popularityScore: number
  recentScore: number
}

export type SearchResultsByType = Record<SearchCollectionType, SearchResultItem[]>
