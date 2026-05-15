// Description: Defines normalized message types for inbox tabs, thread payloads, and backend-backed message actions.
export type MessageTabKey = "multi" | "user" | "group"
export type MessageThreadType = "user" | "group" | "page"

export type MessageTab = {
  id: MessageTabKey
  label: string
  icon: string
}

export type MessageContact = {
  id: string
  name: string
  profileUrl?: string
  status: string
  isOnline: boolean
  avatarUrl: string
  tab: MessageTabKey
  type: MessageThreadType
  preview: string
  time: string
  unreadCount: number
  userId?: number
  groupId?: number
  pageId?: number
  recipientId?: number
  memberCount?: number
  members?: string[]
}

export type MessageItem = {
  id: number
  text: string
  isMine: boolean
  isLast?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
  timestamp?: number
  mediaUrl?: string
  mediaName?: string
  mediaType?: "image" | "video" | "audio" | "gif" | "file"
}

export type MessageSendDraft = {
  text: string
  file?: File | null
}

export type MessageThread = {
  messages: MessageItem[]
  typing: boolean
}

export type MultiMessageSendResult = {
  status: number
  sentCount: number
  failedCount: number
  sentIds: number[]
  failedIds: number[]
  invalidFile?: number
  error?: string
}

export type MessageActionResult = {
  ok: boolean
  message?: string
}
