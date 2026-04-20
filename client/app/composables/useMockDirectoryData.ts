import { computed } from "vue"

export type DirectoryCategoryKey =
  | "all"
  | "users"
  | "pages"
  | "groups"
  | "market"
  | "events"
  | "jobs"
  | "blogs"
  | "funding"
  | "live"
  | "watch"
  | "games"
  | "forum"

export type DirectoryCategory = {
  label: string
  value: DirectoryCategoryKey
  icon: string
  description: string
}

export type DirectoryItem = {
  id: string
  title: string
  category: Exclude<DirectoryCategoryKey, "all">
  categoryLabel: string
  description: string
  meta: string
  count: string
  href: string
  accent: string
  tags: string[]
  featured: boolean
}

export const useMockDirectoryData = () => {
  const { tm } = useI18n()

  const categories = computed(() => tm("pages.directoryPage.categories") as DirectoryCategory[])

  const items = computed(() => tm("pages.directoryPage.items") as DirectoryItem[])

  return { categories, items }
}
