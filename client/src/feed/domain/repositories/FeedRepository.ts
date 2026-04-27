import type { FeedPost, FeedStory } from "../types/feed.types"

export interface FeedRepository {
  listPosts(): FeedPost[]
  listStories(): FeedStory[]
}
