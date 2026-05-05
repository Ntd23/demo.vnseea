// English description: Returns the normalized most-liked posts payload for the popular route.

import { getQuery } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { FeedPostsResponse } from "../../../src/feed/domain/types/feed.types"

type BackendEntity = Record<string, unknown>
type BackendPostsResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

const asRecord = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as BackendEntity
    : {}

const firstString = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }

  return ""
}

const mapMostLikedEntity = (entity: BackendEntity) => {
  const publisher = asRecord(entity.publisher)
  const author = firstString(publisher, ["name", "username"]) || "User"
  const authorUsername = firstString(publisher, ["username"])
  const text = firstString(entity, ["postText", "Orginaltext", "text"]).replace(/<[^>]+>/g, " ").trim()
  const postFile = firstString(entity, ["postFile"])
  const postThumb = firstString(entity, ["postFileThumb"])
  const mediaItems = postFile
    ? [{
        type: postFile.toLowerCase().includes("_video") ? "video" as const : "image" as const,
        src: postFile,
        alt: author,
        thumb: postThumb || undefined,
      }]
    : postThumb
      ? [{
          type: "image" as const,
          src: postThumb,
          alt: author,
        }]
      : []

  return {
    id: asNumber(entity.post_id ?? entity.id),
    author,
    authorAvatarUrl: firstString(publisher, ["avatar", "avatar_full"]),
    authorPath: authorUsername ? `/@${authorUsername}` : "/home",
    role: firstString(publisher, ["working", "school", "address"]) || author,
    audience: "Public",
    time: firstString(entity, ["time_text", "posted", "time"]),
    text,
    tags: Array.from(new Set((text.match(/#[\p{L}\p{N}_-]+/gu) ?? []).map(tag => tag.replace(/^#/, "")))),
    stats: {
      likes: asNumber(entity.post_likes ?? entity.likes ?? entity.likes_count),
      comments: asNumber(entity.post_comments ?? entity.comments ?? entity.comments_count),
      shares: asNumber(entity.post_shares ?? entity.shares ?? entity.shares_count),
      views: asNumber(entity.post_views ?? entity.views ?? entity.view_count),
    },
    comments: [],
    mediaItems,
    category: "community",
    primaryMediaType: mediaItems.some(item => item.type === "video") ? "video" : mediaItems.length ? "image" : "text",
    sourceLabel: "feed",
    sourcePath: "/home",
    isSaved: false,
  }
}

export default defineEventHandler(async (event): Promise<FeedPostsResponse> => {
  const client = createBackendApiClient(event)
  const limit = Number(getQuery(event).limit ?? 10) || 10
  const afterPostId = Number(getQuery(event).afterPostId ?? 0) || 0
  const response = assertBackendApiSuccess(
    await client.post<BackendPostsResponse, Record<string, unknown>>(
      "most_liked",
      {
        limit,
        after_post_id: afterPostId,
      },
    ),
    "Unable to load popular posts.",
  )

  return {
    posts: (response.data ?? []).map(mapMostLikedEntity),
    hasMore: (response.data ?? []).length >= limit,
    nextOffset: (response.data ?? []).length > 0
      ? asNumber((response.data ?? []).at(-1)?.post_id ?? (response.data ?? []).at(-1)?.id)
      : null,
  }
})
