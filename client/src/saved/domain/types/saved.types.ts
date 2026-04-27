import type { FeedPost } from "../../../feed/domain/types/feed.types"

export interface SavedPostEntry {
  id: string
  post: FeedPost
  savedAtLabel: string
  sourceLabel: string
  sourceTo: string
  collectionLabel: string
  note: string
}

export interface SavedSummaryStat {
  label: string
  value: string
  description: string
}
