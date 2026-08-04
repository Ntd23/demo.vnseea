// English description: Lists followed users who can be tagged in the current post context.

import { getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import { normalizeContentAudienceSelection } from "../../../src/shared-kernel/domain/content-audience"
import type { FeedTaggableUsersResponse } from "../../../src/feed/domain/types/feed.types"

type BackendTaggableUser = {
  user_id?: number | string
  name?: string
  username?: string
  avatar?: string
}

type BackendTaggableUsersResponse = {
  api_status?: number | string
  data?: BackendTaggableUser[]
  next_cursor?: number | string | null
  has_more?: boolean | number | string
  errors?: { error_text?: string }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asPositiveNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : undefined
}

const isTruthy = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true"

export default defineEventHandler(async (event): Promise<FeedTaggableUsersResponse> => {
  const query = getQuery(event)
  const audience = normalizeContentAudienceSelection(query.audience)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendTaggableUsersResponse, Record<string, unknown>>(
      "post-taggable-users",
      {
        query: asString(query.query),
        postPrivacy: audience.privacy,
        privacy_contract: "audience_v2",
        page_id: asPositiveNumber(query.pageId) || 0,
        event_id: asPositiveNumber(query.eventId) || 0,
        group_id: asPositiveNumber(query.groupId) || 0,
        cursor: asString(query.cursor),
        limit: Math.min(20, asPositiveNumber(query.limit) || 20),
      },
    ),
    "Unable to load people you can tag.",
  )

  const users = (response.data ?? []).flatMap((user) => {
    const id = asPositiveNumber(user.user_id)
    const username = asString(user.username).replace(/^@+/, "")
    if (!id || !username) return []

    return [{
      id,
      name: asString(user.name) || username,
      username,
      avatarUrl: resolveMediaUrl(user.avatar),
      profilePath: appRoutes.profile(username),
    }]
  })

  return {
    users,
    hasMore: isTruthy(response.has_more),
    nextCursor: asString(response.next_cursor) || null,
  }
})
