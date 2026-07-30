// Description: Defines normalized message types for inbox tabs, thread payloads, realtime typing, and backend-backed message actions.
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"

export type MessageTabKey = "multi" | "user" | "group"
export type MessageThreadType = "user" | "group" | "page"

export type MessageTab = {
  id: MessageTabKey
  label: string
  icon: string
}

export type MessageUserTag = {
  id: number
  name: string
  color: string
}

export type MessageContact = {
  id: string
  name: string
  profileUrl?: string
  status: string
  isOnline: boolean
  lastSeenAt?: number
  avatarUrl: string
  tab: MessageTabKey
  type: MessageThreadType
  preview: string
  time: string
  unreadCount: number
  lastActivityAt?: number
  isFollowing?: boolean
  isFollowingMe?: boolean
  hasFollowRelationship?: boolean
  relationshipActivityAt?: number
  userId?: number
  chatId?: number
  groupId?: number
  pageId?: number
  recipientId?: number
  memberCount?: number
  members?: string[]
  tags?: MessageUserTag[]
  notificationsMuted?: boolean
}

export type MessageGroupMember = {
  userId: number
  name: string
  username?: string
  avatarUrl: string
  profileUrl?: string
  isOnline?: boolean
  isOwner: boolean
  isSelf: boolean
}

export type MessageGroupCandidate = {
  userId: number
  name: string
  username?: string
  avatarUrl: string
  profileUrl?: string
}

export type MessageGroupCreateCandidate = {
  userId: number
  name: string
  username?: string
  avatarUrl: string
  profileUrl?: string
}

export type MessageGroupCreateDraft = {
  name: string
  recipientIds: number[]
  avatar?: File | null
}

export type MessageProductCard = {
  id: string
  title: string
  imageUrl?: string
  price: string
  href: string
}

export type MessageProductLaunchContext = {
  sellerId: number
  product: MessageProductCard
  suggestions: string[]
}

export type MessageStoryContext = {
  id: number
  available: boolean
  ownerId?: number
  author: string
  avatarUrl?: string
  mediaUrl?: string
  mediaType?: "image" | "video"
  posterUrl?: string
  title?: string
  caption?: string
  createdAt?: number
}

export type MessageSharedPostCard = {
  postId: number
  available: boolean
  author: string
  authorAvatarUrl?: string
  text: string
  imageUrl?: string
  href: string
  job?: {
    title: string
    description: string
    imageUrl?: string
    href: string
    location: string
    categoryLabel: string
    typeLabel: string
    salaryLabel: string
  }
  product?: {
    id: number
    title: string
    description: string
    href: string
    price: number
    point: number
    currency?: string
    currencySymbol?: string
  }
}

export type MessageSystemEvent = {
  type: "message_pinned" | "message_unpinned"
  actorId: number
  actorName: string
  targetMessageId: number
}

export type MessageGroupUpdateDraft = {
  groupId: number
  name?: string
  avatar?: File | null
}

export type MessageGroupDetails = {
  groupId: number
  name: string
  avatarUrl: string
  ownerId: number
  canManage: boolean
  memberCount: number
  members: MessageGroupMember[]
}

export type MessageItem = {
  id: number
  text: string
  isMine: boolean
  isLast?: boolean
  showAuthor?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
  timestamp?: number
  senderId?: number
  senderIsOnline?: boolean
  authorName?: string
  authorProfileUrl?: string
  threadType?: MessageThreadType
  mediaUrl?: string
  mediaName?: string
  mediaType?: "image" | "video" | "audio" | "gif" | "file" | "record"
  story?: MessageStoryContext
  productCard?: MessageProductCard
  sharedPost?: MessageSharedPostCard
  selectedReaction?: FeedStoryReactionType | null
  isDeleted?: boolean
  deletedAt?: number
  deletedTime?: string
  deletedByName?: string
  systemEvent?: MessageSystemEvent
  callLog?: {
    type: "audio" | "video"
    status: string
    duration?: number
    callId?: number
    groupId?: number
    isGroup?: boolean
    isActive?: boolean
    participantCount?: number
  }
}

export type MessageRecordDraft = {
  blob: Blob
  fileName: string
  mimeType: string
  durationMs: number
  previewUrl: string
}

export type UploadedMessageRecord = {
  url: string
  name: string
  mimeType: string
  durationMs: number
  previewUrl?: string
}

export type MessageComposerDraft = {
  text: string
  file?: File | null
  record?: MessageRecordDraft | null
}

export type MessageSendDraft = {
  text: string
  file?: File | null
  record?: UploadedMessageRecord | null
}

export type MessageThread = {
  messages: MessageItem[]
  pinnedMessages: MessagePinnedItem[]
  typing: boolean
}

export type MessageSharedContentKind = "image" | "video" | "file" | "link"

export type MessageSharedContentItem = {
  id: number
  kind: MessageSharedContentKind
  url: string
  title: string
  senderName: string
  time: string
  timestamp: number
  isMine: boolean
}

export type MessageSharedContent = {
  media: MessageSharedContentItem[]
  files: MessageSharedContentItem[]
  links: MessageSharedContentItem[]
}

export type MessagePinnedItem = MessageItem & {
  pinnedAt: number
  pinnedByUserId: number
  pinnedByName: string
  canUnpin: boolean
}

export type MessageTypingState = {
  enabled: boolean
  typing: boolean
  activeUserIds?: number[]
}

export type MessageRealtimeToken = {
  token: string
  expiresAt: number
  enabled: boolean
  url: string
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

export type MessageCreateGroupResult = MessageActionResult & {
  groupId?: number
}

export type MessageTagsPayload = {
  labels: MessageUserTag[]
  contacts: MessageContact[]
}
