export type BlogCategory =
  | "all"
  | "vehicles"
  | "business"
  | "education"
  | "movies"
  | "gaming"
  | "history"
  | "lifestyle"
  | "pets"
  | "science"
  | "sports"
  | "travel"
  | "people"
  | "other"

export type BlogCategoryValue = Exclude<BlogCategory, "all">

export type CreateBlogCategoryValue = Exclude<BlogCategoryValue, "vehicles">

export type BlogSortValue = "latest" | "popular" | "views" | "reading"

export interface BlogOption<TValue extends string = string> {
  label: string
  value: TValue
  icon?: string
}

export interface BlogStat {
  label: string
  value: string | number
  description: string
}

export interface BlogArticle {
  id: number
  title: string
  excerpt: string
  category: BlogCategoryValue
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  publishedAt: string
  publishedHoursAgo: number
  views: number
  readMinutes: number
  likes: number
  tags: string[]
  image: string
  imageFallback: string
  href: string
  mine?: boolean
}

export interface BlogTopic extends BlogOption<BlogCategoryValue> {
  icon: string
  count: number
}

export interface FeaturedBlogAuthor {
  name: string
  initials: string
  gradient: string
  count: number
  topic: string
}

export interface ReadBlogArticle {
  slug: string
  title: string
  excerpt: string
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  publishedAt: string
  views: number
  readMinutes: number
  likes: number
  tags: string[]
  image: string
  imageFallback: string
  body: string[]
}

export interface BlogComment {
  id: number
  author: string
  initials: string
  time: string
  body: string
}

export interface BlogEditorAction {
  label: string
  icon: string
  token: string
}

export interface CreateBlogChecklistItem {
  label: string
  description: string
  done: boolean
}

export interface HashtagChip {
  label: string
  slug: string
  count: number
  to: string
}
