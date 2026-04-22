import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type ForumSectionKey = "all" | "announcements" | "support" | "marketplace" | "events" | "jobs" | "showcase"

export type ForumSection = {
  label: string
  value: ForumSectionKey
  icon: string
  description: string
}

export type ForumReply = {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
  accepted?: boolean
}

export type ForumThread = {
  id: string
  title: string
  section: Exclude<ForumSectionKey, "all">
  sectionLabel: string
  author: string
  authorInitials: string
  authorRole: string
  status: "open" | "solved" | "pinned"
  createdAt: string
  views: number
  repliesCount: number
  excerpt: string
  tags: string[]
  replies: ForumReply[]
}

export type ForumThreadPayload = {
  title: string
  section: Exclude<ForumSectionKey, "all">
  message: string
}

export const useMockForumData = () => {
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

export const formatForumNumber = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value)
