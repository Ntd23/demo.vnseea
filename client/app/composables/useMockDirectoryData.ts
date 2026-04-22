import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

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

export const directoryCategoryKeys: DirectoryCategoryKey[] = [
  "all",
  "users",
  "pages",
  "groups",
  "market",
  "events",
  "jobs",
  "blogs",
  "funding",
  "live",
  "watch",
  "games",
  "forum",
]

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
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed(() => localized<DirectoryCategory[]>("pages.directoryPage.categories"))

  const items = computed(() => localized<DirectoryItem[]>("pages.directoryPage.items"))

  return { categories, items }
}
