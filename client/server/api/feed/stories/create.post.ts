// English description: Creates a new story through the backend API v2 create-story endpoint.

import { createError, getHeader, readMultipartFormData } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { postBackendApiUpload } from "../../../utils/backend-api-upload"
import { fetchLatestOwnStory } from "../_shared"
import { contentAudiencePrivacy, normalizeContentAudience } from "../../../../src/shared-kernel/domain/content-audience"

type BackendCreateStoryResponse = {
  api_status?: number | string
  story_id?: number | string
  errors?: {
    error_text?: string
  }
}

type StoryOverlayItem = {
  content: string
  x: number
  y: number
  username?: string
}

const normalizeOverlayItem = (value: unknown, maxLength: number): StoryOverlayItem | undefined => {
  if (!value || typeof value !== "object") return undefined

  const item = value as Partial<StoryOverlayItem>
  const content = typeof item.content === "string"
    ? item.content.trim().slice(0, maxLength)
    : ""

  if (!content) return undefined

  const x = Number(item.x)
  const y = Number(item.y)
  const username = typeof item.username === "string"
    ? item.username.trim().replace(/^@/, "").replace(/[^\p{L}\p{N}_.-]/gu, "").slice(0, 64)
    : ""

  return {
    content,
    x: Number.isFinite(x) ? Math.min(0.94, Math.max(0.06, x)) : 0.5,
    y: Number.isFinite(y) ? Math.min(0.9, Math.max(0.1, y)) : 0.5,
    ...(username ? { username } : {}),
  }
}

const normalizeStoryOverlays = (value: string) => {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>
    const text = normalizeOverlayItem(parsed.text, 100)
    const mention = normalizeOverlayItem(parsed.mention, 300)

    return {
      ...(text ? { text } : {}),
      ...(mention ? { mention } : {}),
    }
  }
  catch {
    return {}
  }
}

export default defineEventHandler(async (event) => {
  const contentType = getHeader(event, "content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Story upload must use multipart form data.",
    })
  }

  const parts = await readMultipartFormData(event) ?? []
  const payload = new FormData()
  let fileAttached = false
  let privacy = "followers"

  for (const part of parts) {
    if (!part.name) {
      continue
    }

    if (part.filename && part.name === "file") {
      payload.append(
        "file",
        new Blob([part.data], { type: part.type || "application/octet-stream" }),
        part.filename,
      )
      fileAttached = true
      continue
    }

    if (part.filename && part.name === "cover") {
      payload.append(
        "cover",
        new Blob([part.data], { type: part.type || "image/jpeg" }),
        part.filename,
      )
      continue
    }

    const value = part.data.toString().trim()

    if (!value) {
      continue
    }

    if (part.name === "fileType") {
      payload.append("file_type", value)
      continue
    }

    if (part.name === "title") {
      payload.append("story_title", value)
      continue
    }

    if (part.name === "description") {
      payload.append("story_description", value)
    }

    if (part.name === "overlays") {
      const overlays = normalizeStoryOverlays(value)

      if (Object.keys(overlays).length) {
        payload.append("story_overlay", JSON.stringify(overlays))
      }
    }

    if (part.name === "privacy") privacy = normalizeContentAudience(value)
  }

  if (!fileAttached) {
    throw createError({
      statusCode: 400,
      statusMessage: "Story file is required.",
    })
  }

  payload.append("privacy_contract", "audience_v2")
  payload.append("privacy", contentAudiencePrivacy[normalizeContentAudience(privacy)])

  const response = assertBackendApiSuccess(
    await postBackendApiUpload<BackendCreateStoryResponse>(
      event,
      "create-story",
      payload,
    ),
    "Unable to create story.",
  )

  const story = await fetchLatestOwnStory(event).catch(() => null)

  return {
    ok: true,
    storyId: Number(response.story_id ?? 0) || undefined,
    story,
  }
})
