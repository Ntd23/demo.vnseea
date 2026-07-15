// English description: Resolves the current avatar or cover's backing post through the legacy profile-media lookup.

import { getQuery, getRouterParam } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../../utils/backend-current-user"
import { createBackendWebClient } from "../../../utils/backend-web-client"

type BackendEntity = Record<string, unknown>

type BackendProfileResponse = {
  api_status?: number | string
  user_data?: BackendEntity
  errors?: {
    error_text?: string
  }
}

type BackendMediaPostResponse = {
  status?: number | string
  post_id?: number | string
}

const asRecord = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as BackendEntity
    : {}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const firstString = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }

  return ""
}

const normalizeUsername = (value: unknown) => {
  const raw = String(value ?? "")

  try {
    return decodeURIComponent(raw).trim().replace(/^@+/, "")
  } catch {
    return raw.trim().replace(/^@+/, "")
  }
}

const toBackendMediaPath = (value: string) => {
  const withoutQuery = value.split(/[?#]/, 1)[0] ?? ""
  let pathname = withoutQuery

  try {
    pathname = decodeURIComponent(new URL(withoutQuery, "https://profile-media.local").pathname)
  } catch {
    pathname = withoutQuery
  }

  pathname = pathname.replace(/\\/g, "/").replace(/^\/+/, "")
  const uploadIndex = pathname.toLowerCase().indexOf("upload/")

  if (uploadIndex >= 0) {
    pathname = pathname.slice(uploadIndex)
  }

  return pathname.replace(/_full(?=\.[^./]+$)/i, "")
}

export default defineEventHandler(async (event) => {
  const username = normalizeUsername(getRouterParam(event, "username"))
  const kind = String(getQuery(event).kind ?? "")

  if (!username || (kind !== "avatar" && kind !== "cover")) {
    return { postId: 0 }
  }

  const currentUser = await getBackendCurrentUser(event).catch(() => null)

  if (!currentUser) {
    return { postId: 0 }
  }

  const profileResponse = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendProfileResponse, Record<string, unknown>>(
      "get-user-data-username",
      {
        username,
        fetch: "user_data",
      },
    ),
    "Unable to resolve profile media.",
  )
  const user = asRecord(profileResponse.user_data)
  const image = kind === "avatar"
    ? firstString(user, ["avatar_org", "avatar"])
    : firstString(user, ["cover_org", "cover"])
  const backendImagePath = toBackendMediaPath(image)

  if (!backendImagePath || !backendImagePath.toLowerCase().includes("upload/")) {
    return { postId: 0 }
  }

  const action = kind === "avatar"
    ? "get_user_profile_image_post"
    : "get_user_profile_cover_image_post"

  try {
    const rawResponse = await createBackendWebClient(event).postForm<BackendMediaPostResponse>(
      action,
      { image: backendImagePath },
    )
    const response = asRecord(rawResponse)
    const status = Number(response.status ?? 0)
    const postId = Number(response.post_id ?? 0)

    return {
      postId: status === 200 && Number.isFinite(postId) && postId > 0
        ? postId
        : 0,
    }
  } catch {
    return { postId: 0 }
  }
})
