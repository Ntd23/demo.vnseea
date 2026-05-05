// English description: Creates a new timeline post through the backend API v2 new_post endpoint.

import { createError, readBody } from "h3"
import { mapPostRecord } from "../_shared"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { postBackendApiUpload } from "../../../utils/backend-api-upload"
import type { FeedPostRecord } from "../../../../src/feed/domain/types/feed.types"

type BackendCreatePostResponse = {
  api_status?: number | string
  post_data?: Record<string, unknown>
  errors?: {
    error_text?: string
  }
}

const mapAudienceToPrivacy = (value: string) => {
  if (value === "friends" || value === "connections") return "1"
  if (value === "group") return "2"
  if (value === "private" || value === "only-me") return "3"
  return "0"
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const text = typeof body.text === "string" ? body.text.trim() : ""
  const audience = typeof body.audience === "string" ? body.audience.trim() : "public"

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post text is required.",
    })
  }

  const payload = new URLSearchParams()
  payload.append("postText", text)
  payload.append("postPrivacy", mapAudienceToPrivacy(audience))

  const response = assertBackendApiSuccess(
    await postBackendApiUpload<BackendCreatePostResponse>(
      event,
      "new_post",
      payload,
    ),
    "Unable to create post.",
  )

  const createdPost = response.post_data
    ? mapPostRecord(response.post_data)
    : null

  return {
    ok: true,
    post: createdPost as FeedPostRecord | null,
  }
})
