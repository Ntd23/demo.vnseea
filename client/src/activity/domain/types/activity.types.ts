// English description: Defines private Activity Center categories and compact post records.
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"

export type ActivityCenterTab = "saved" | "reaction" | "comment" | "share"
export type ActivityShareDestination = "timeline" | "page" | "group"

export type PostActivityItem = {
  id: string
  postId: number
  category: ActivityCenterTab
  reactionType?: string
  interactionCount?: number
  latestCommentText?: string
  shareDestination?: ActivityShareDestination
  actionTime?: number
  post: FeedPostRecord
}

export type PostActivityPage = {
  items: PostActivityItem[]
  nextCursor?: string
  hasMore: boolean
}
