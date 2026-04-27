import type { FeedMediaItem, FeedPost } from "../types/feed.types"

export function createFeedMediaItems(post: FeedPost): FeedMediaItem[] {
  const count = post.media === "double" ? 2 : post.media ? 1 : 0

  return Array.from({ length: count }, (_, index) => ({
    type: "image" as const,
    src: `https://picsum.photos/seed/${encodeURIComponent(post.author)}-${index + 1}/1200/900`,
    alt: `${post.author} media ${index + 1}`,
  }))
}
