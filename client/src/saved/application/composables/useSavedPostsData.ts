// English description: Maps normalized feed posts into saved-post cards without relying on mock collections or fallback entries.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"

export type SavedPostEntry = {
  id: string
  postId: number
  post: FeedPostRecord
  savedAtLabel: string
  sourceLabel: string
  sourceTo: string
  collectionLabel: string
  note: string
}

export function mapFeedPostsToSavedPosts(posts: FeedPostRecord[]): SavedPostEntry[] {
  return posts.map(post => ({
    id: `saved-${post.id}`,
    postId: post.id,
    post,
    savedAtLabel: post.time,
    sourceLabel: post.author,
    sourceTo: post.sourcePath,
    collectionLabel: post.category,
    note: post.text || post.role,
  }))
}
