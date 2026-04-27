export interface FeedComment {
  id: number
  author: string
  role: string
  text: string
}

export interface FeedPost {
  id: number | string
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: {
    likes: number
    comments: number
    shares: number
  }
  media?: "double" | "single"
  comments: FeedComment[]
}

export interface FeedStory {
  id: number
  author: string
  avatar: string
  gradient: string
  isMe?: boolean
  title?: string
  caption?: string
  media?: string
  meta?: string
  likes: number
  comments: number
  views: number
}

export interface FeedMediaItem {
  type: "image" | "video"
  src: string
  alt?: string
}

export type PublisherAction = "image" | "video" | "poll" | "gif" | "feeling" | "audio" | "file" | "story" | "product" | ""
export type PublisherAudience = "public" | "connections" | "group"
export type PublisherChip = "onlyMe" | "location" | "tagFriends" | "colors"
export type PublisherStatus = "idle" | "ready" | "loading" | "success" | "error"

export interface FeedOption<TValue extends string = string> {
  value: TValue
  label: string
  icon: string
}
