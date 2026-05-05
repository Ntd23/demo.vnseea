// English description: Defines normalized feed, story, explore, memory, and poke types shared across Dev 2 social pages.

import type { CommunityPageRecord } from "../../../community/domain/types/community.types"

export type FeedMediaItem = {
  type: "image" | "video"
  src: string
  alt?: string
  mime?: string
  thumb?: string
}

export type FeedCommentRecord = {
  id: number
  author: string
  role: string
  text: string
}

export type FeedPostRecord = {
  id: number
  author: string
  authorAvatarUrl: string
  authorPath: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  comments: FeedCommentRecord[]
  mediaItems: FeedMediaItem[]
  category: string
  primaryMediaType: "text" | "image" | "video" | "link" | "music" | "file"
  sourceLabel: string
  sourcePath: string
  isSaved: boolean
}

export type FeedPostsResponse = {
  posts: FeedPostRecord[]
  hasMore: boolean
  nextOffset: number | null
}

export type FeedCreatePostResponse = {
  ok: boolean
  post: FeedPostRecord | null
}

export type FeedCreateStoryResponse = {
  ok: boolean
  storyId?: number
  story: FeedStoryRecord | null
}

export type FeedStoryRecord = {
  id: number
  ownerId: number
  ownerKey: string
  ownerUsername: string
  author: string
  avatar: string
  avatarUrl: string
  gradient: string
  media: string
  title: string
  caption: string
  meta: string
  likes: number
  comments: number
  views: number
  isMe: boolean
}

export type FeedAnnouncement = {
  title: string
  message: string
}

export type FeedHomeResponse = FeedPostsResponse & {
  stories: FeedStoryRecord[]
  announcement: FeedAnnouncement | null
}

export type FeedHashtagChip = {
  label: string
  slug: string
  count: number
  to: string
}

export type FeedExploreUserRecord = {
  id: number
  name: string
  username: string
  initials: string
  href: string
  role: string
  meta: string
  reason: string
  tags: string[]
  mutualLabel: string
  accent: string
  online: boolean
  avatarUrl: string
}

export type FeedExploreResponse = {
  posts: FeedPostRecord[]
  users: FeedExploreUserRecord[]
  pages: CommunityPageRecord[]
  hashtags: FeedHashtagChip[]
  announcement: FeedAnnouncement | null
}

export type FeedMemoryFriendRecord = {
  id: string
  name: string
  initials: string
  label: string
  note: string
}

export type FeedMemoryRecord = {
  id: string
  post: FeedPostRecord
  happenedOnLabel: string
  memoryLabel: string
  yearOffset: number
  reflection: string
}

export type FeedMemoriesResponse = {
  posts: FeedMemoryRecord[]
  friends: FeedMemoryFriendRecord[]
}

export type FeedPokeRecord = {
  id: string
  pokeId: number
  userId: number
  name: string
  initials: string
  href: string
  role: string
  timeLabel: string
  mutualLabel: string
  contextLabel: string
  note: string
  accent: string
  online?: boolean
  avatarUrl: string
  isFollowing: boolean
}

export type FeedPokeActionResult = {
  ok: boolean
  record?: FeedPokeRecord
}
