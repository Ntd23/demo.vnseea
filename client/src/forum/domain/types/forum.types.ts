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
