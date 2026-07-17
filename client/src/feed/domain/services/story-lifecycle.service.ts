// English description: Defines the shared 24-hour lifecycle for image and video stories across server mapping and the live carousel.

import type { FeedStoryRecord } from "../types/feed.types"

export const feedStoryLifetimeMs = 24 * 60 * 60 * 1000

export function getFeedStoryExpiration(story: FeedStoryRecord) {
  if (!Number.isFinite(story.createdAt) || story.createdAt <= 0) {
    return null
  }

  return story.createdAt + feedStoryLifetimeMs
}

export function isFeedStoryExpired(story: FeedStoryRecord, now = Date.now()) {
  const expiresAt = getFeedStoryExpiration(story)
  return expiresAt !== null && expiresAt <= now
}
