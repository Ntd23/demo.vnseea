import type { FeedPost } from "../../../feed/domain/types/feed.types"

export interface MemoryEntry {
  id: string
  post: FeedPost
  happenedOnLabel: string
  memoryLabel: string
  yearOffset: number
  reflection: string
}
