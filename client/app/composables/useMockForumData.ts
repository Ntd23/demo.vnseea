import { computed } from "vue"

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
  const { tm } = useI18n()

  const sections = computed(() => tm("pages.forumPage.sections") as ForumSection[])

  const threads = computed(() => tm("pages.forumPage.threads") as ForumThread[])

  return {
    sections,
    threads,
  }
}

export const formatForumNumber = (value: number, locale = "vi") =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value)
