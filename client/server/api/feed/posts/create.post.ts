// English description: Creates a new timeline post through the backend API v2 new_post endpoint, including text, feeling, image, and video uploads.

import { createError, getHeader, readBody, readMultipartFormData } from "h3"
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

type CreatePostPayload = {
  text: string
  audience: string
  feeling: string
  imageFile: {
    filename?: string
    type?: string
    data: Buffer
  } | null
  videoFile: {
    filename?: string
    type?: string
    data: Buffer
  } | null
  pageId?: number
}

const mapAudienceToPrivacy = (value: string) => {
  if (value === "friends" || value === "connections") return "1"
  if (value === "group") return "2"
  if (value === "private" || value === "only-me") return "3"
  return "0"
}

const allowedFeelings = new Set([
  "happy",
  "loved",
  "sad",
  "so_sad",
  "angry",
  "confused",
  "smirk",
  "broke",
  "expressionless",
  "cool",
  "funny",
  "tired",
  "lovely",
  "blessed",
  "shocked",
  "sleepy",
  "pretty",
  "bored",
])

const parseJsonPayload = async (event: Parameters<typeof defineEventHandler>[0]): Promise<CreatePostPayload> => {
  const body = await readBody<Record<string, unknown>>(event)

  return {
    text: typeof body.text === "string" ? body.text.trim() : "",
    audience: typeof body.audience === "string" ? body.audience.trim() : "public",
    feeling: typeof body.feeling === "string" ? body.feeling.trim() : "",
    imageFile: null,
    videoFile: null,
    pageId: body.pageId ? Number(body.pageId) : undefined,
  }
}

const parseMultipartPayload = async (event: Parameters<typeof defineEventHandler>[0]): Promise<CreatePostPayload> => {
  const parts = await readMultipartFormData(event) ?? []
  const payload: CreatePostPayload = {
    text: "",
    audience: "public",
    feeling: "",
    imageFile: null,
    videoFile: null,
    pageId: undefined,
  }

  for (const part of parts) {
    if (!part.name) {
      continue
    }

    if (part.filename) {
      const file = {
        filename: part.filename,
        type: part.type,
        data: part.data,
      }

      if (part.name === "postPhotos[]" || part.name === "postPhotos") {
        payload.imageFile = file
      }
      else if (part.name === "postVideo") {
        payload.videoFile = file
      }

      continue
    }

    const value = part.data.toString().trim()

    if (part.name === "text") payload.text = value
    if (part.name === "audience") payload.audience = value || "public"
    if (part.name === "feeling") payload.feeling = value
    if (part.name === "pageId") payload.pageId = Number(value)
  }

  return payload
}

export default defineEventHandler(async (event) => {
  const contentType = getHeader(event, "content-type") || ""
  const payload = contentType.includes("multipart/form-data")
    ? await parseMultipartPayload(event)
    : await parseJsonPayload(event)

  if (!payload.text && !payload.imageFile && !payload.videoFile && !payload.feeling) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post content is required.",
    })
  }

  if (payload.feeling && !allowedFeelings.has(payload.feeling)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post feeling is invalid.",
    })
  }

  const requestBody = payload.imageFile || payload.videoFile
    ? new FormData()
    : new URLSearchParams()

  requestBody.append("postText", payload.text)
  requestBody.append("postPrivacy", mapAudienceToPrivacy(payload.audience))

  if (payload.pageId) {
    requestBody.append("page_id", String(payload.pageId))
  }

  if (payload.feeling) {
    requestBody.append("feeling_type", "feelings")
    requestBody.append("feeling", payload.feeling)
  }

  if (payload.imageFile) {
    requestBody.append(
      "postPhotos[]",
      new File([payload.imageFile.data], payload.imageFile.filename || "post-image.jpg", {
        type: payload.imageFile.type || "image/jpeg",
      }),
    )
  }

  if (payload.videoFile) {
    requestBody.append(
      "postVideo",
      new File([payload.videoFile.data], payload.videoFile.filename || "post-video.mp4", {
        type: payload.videoFile.type || "video/mp4",
      }),
    )
  }

  const response = assertBackendApiSuccess(
    await postBackendApiUpload<BackendCreatePostResponse>(
      event,
      "new_post",
      requestBody,
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
