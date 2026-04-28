import { computed } from "vue"
import { resolveI18nMessage } from "#shared-kernel/application/utils/resolveI18nMessage"
import type {
  ForumReply,
  ForumSection,
  ForumSectionKey,
  ForumThread,
  ForumThreadPayload,
} from "../../domain/types/forum.types"

export const forumSectionKeys = [
  "all",
  "announcements",
  "support",
  "marketplace",
  "events",
  "jobs",
  "showcase",
] as const satisfies readonly ForumSectionKey[]

export const useForumCatalog = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const sections = computed(() => localized<ForumSection[]>("pages.forumPage.sections"))

  const threads = computed(() => localized<ForumThread[]>("pages.forumPage.threads"))

  return {
    sections,
    threads,
  }
}

export function readForumQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

export function normalizeForumSection(value: string): ForumSectionKey {
  return forumSectionKeys.includes(value as ForumSectionKey)
    ? value as ForumSectionKey
    : "all"
}

export function filterForumThreads(
  threads: readonly ForumThread[],
  search: string,
  section: ForumSectionKey,
) {
  const keyword = search.trim().toLowerCase()

  return threads.filter((thread) => {
    const matchesSection = section === "all" || thread.section === section
    const matchesKeyword = keyword.length === 0 || [
      thread.title,
      thread.author,
      thread.sectionLabel,
      thread.excerpt,
      ...thread.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesSection && matchesKeyword
  })
}

export const formatForumNumber = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value)
