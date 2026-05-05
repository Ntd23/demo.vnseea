// English description: Returns normalized backend profile data by username for the Nuxt profile page.

import { createError, getRouterParam } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type { ProfileApiResponse, ProfileConnection } from "../../../src/profile/domain/types/profile.types"

type BackendProfileEntity = Record<string, unknown>

type BackendProfileResponse = {
  api_status?: number | string
  user_data?: BackendProfileEntity
  followers?: BackendProfileEntity[]
  following?: BackendProfileEntity[]
  liked_pages?: BackendProfileEntity[]
  joined_groups?: BackendProfileEntity[]
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

const isTruthy = (value: unknown) =>
  value === true
  || value === 1
  || value === "1"
  || value === "yes"
  || value === "true"

const firstString = (entity: BackendProfileEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }

  return ""
}

const createInitials = (value: string, fallback = "PF") => {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return initials || fallback
}

const toConnection = (entity: BackendProfileEntity): ProfileConnection => {
  const id = asNumber(entity.user_id ?? entity.id)
  const name = firstString(entity, ["name", "username"]) || `User ${id}`
  const username = asString(entity.username)
  const meta = firstString(entity, ["working", "lastseen_time_text", "gender_text", "address"]) || username

  return {
    id,
    name,
    username,
    initials: createInitials(name, "US"),
    meta,
  }
}

export default defineEventHandler(async (event): Promise<ProfileApiResponse | null> => {
  const username = String(getRouterParam(event, "username") ?? "").trim()
  const resolveMediaUrl = createBackendMediaUrlResolver(event)

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username is required.",
    })
  }

  const currentUser = await getBackendCurrentUser(event)
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendProfileResponse, Record<string, unknown>>(
      "get-user-data-username",
      {
        username,
        fetch: "user_data,followers,following,liked_pages,joined_groups",
      },
    ),
    "Unable to load profile.",
  )

  const user = response.user_data

  if (!user) {
    return null
  }

  const displayName = firstString(user, ["name", "username"]) || username
  const resolvedUsername = firstString(user, ["username"]) || username

  return {
    id: asNumber(user.user_id ?? user.id),
    username: resolvedUsername,
    displayName,
    headline: firstString(user, ["working", "school"]),
    bio: firstString(user, ["about"]),
    coverImage: resolveMediaUrl(firstString(user, ["cover_full", "cover"])),
    avatarUrl: resolveMediaUrl(firstString(user, ["avatar_full", "avatar"])) || undefined,
    avatarText: createInitials(displayName),
    verified: isTruthy(user.verified),
    isOwner: asNumber(user.user_id ?? user.id) === asNumber(currentUser.user_id),
    statusText: firstString(user, ["lastseen_time_text", "gender_text"]),
    website: firstString(user, ["website"]),
    working: firstString(user, ["working"]),
    school: firstString(user, ["school"]),
    address: firstString(user, ["address"]),
    email: firstString(user, ["email"]),
    phone: firstString(user, ["phone_number"]),
    gender: firstString(user, ["gender_text", "gender"]),
    birthday: firstString(user, ["birthday"]),
    relationship: firstString(user, ["relationship"]),
    followersCount: response.followers?.length ?? asNumber(user.followers_count ?? user.followers),
    followingCount: response.following?.length ?? asNumber(user.following_count ?? user.following),
    likedPagesCount: response.liked_pages?.length ?? 0,
    joinedGroupsCount: response.joined_groups?.length ?? 0,
    followers: (response.followers ?? []).map(toConnection),
    following: (response.following ?? []).map(toConnection),
  }
})
