// English description: Proxies the authenticated current-state post activity collection.
import { createError, getQuery } from "h3"
import { mapPostRecord } from "../feed/_shared"
import { createBackendApiClient } from "../../utils/backend-api-client"

const activityCategories = ["saved", "reaction", "comment", "share"] as const
type ActivityCategory = typeof activityCategories[number]

type BackendActivityItem = {
  id?: string | number
  post_id?: string | number
  category?: string
  reaction_type?: string | number
  interaction_count?: string | number
  latest_comment_text?: string
  share_destination?: string
  action_time?: string | number
  post_data?: Record<string, unknown>
}

type BackendActivityResponse = {
  api_status?: string | number
  data?: BackendActivityItem[]
  next_cursor?: string
  has_more?: boolean | string | number
  errors?: { error_text?: string }
}

const isActivityCategory = (value: string): value is ActivityCategory =>
  activityCategories.includes(value as ActivityCategory)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = String(query.category ?? "saved").trim().toLowerCase()
  const rawLimit = Number(query.limit ?? 20)

  if (!isActivityCategory(category)) {
    throw createError({ statusCode: 400, statusMessage: "Activity category is invalid." })
  }
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 30) {
    throw createError({ statusCode: 400, statusMessage: "Activity limit must be between 1 and 30." })
  }

  const cursor = typeof query.cursor === "string" ? query.cursor.trim() : ""
  const response = await createBackendApiClient(event).post<BackendActivityResponse>("post-activity", {
    category,
    limit: rawLimit,
    ...(cursor ? { cursor } : {}),
  })

  if (Number(response.api_status) !== 200) {
    throw createError({
      statusCode: Number(response.api_status) === 401 ? 401 : 502,
      statusMessage: response.errors?.error_text || "Could not load post activity.",
    })
  }

  return {
    items: (response.data ?? []).flatMap((item) => {
      if (!item.post_data || !item.post_id || !isActivityCategory(String(item.category))) {
        return []
      }
      return [{
        id: String(item.id ?? `${category}:${item.post_id}`),
        postId: Number(item.post_id),
        category,
        reactionType: item.reaction_type ? String(item.reaction_type) : undefined,
        interactionCount: Number(item.interaction_count ?? 0),
        latestCommentText: item.latest_comment_text || undefined,
        shareDestination: ["timeline", "page", "group"].includes(String(item.share_destination))
          ? item.share_destination
          : undefined,
        actionTime: Number(item.action_time ?? 0) || undefined,
        post: mapPostRecord(item.post_data),
      }]
    }),
    nextCursor: response.next_cursor || undefined,
    hasMore: response.has_more === true || response.has_more === 1 || response.has_more === "1",
  }
})
