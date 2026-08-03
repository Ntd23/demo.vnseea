// English description: Returns the current authenticated backend user mapped into the shared frontend auth shape.

import { setHeader } from "h3"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type { CurrentAuthUser } from "../../../src/auth/domain/types/auth.types"

type BackendCurrentUserPayload = {
  user_id?: number | string
  name?: string
  username?: string
  avatar?: string
  admin?: number | string
  is_pro?: number | string
  pro_type?: number | string
  can_boost_posts?: number | string
  can_boost_pages?: number | string
  wallet?: number | string
  points?: number | string
}

const asNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

export default defineEventHandler(async (event): Promise<CurrentAuthUser | null> => {
  setHeader(event, "Cache-Control", "private, no-store, no-cache, max-age=0, must-revalidate")
  setHeader(event, "Pragma", "no-cache")
  setHeader(event, "Expires", "0")
  setHeader(event, "Vary", "Cookie")

  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const user = await getBackendCurrentUser(event) as BackendCurrentUserPayload
  const adminLevel = Number(user.admin ?? 0)

  return {
    id: Number(user.user_id),
    name: asNonEmptyString(user.name) || "User",
    username: asNonEmptyString(user.username),
    avatarUrl: resolveMediaUrl(user.avatar) || undefined,
    role: adminLevel === 1 ? "admin" : adminLevel === 2 ? "moderator" : "user",
    isAdmin: adminLevel === 1,
    isModerator: adminLevel === 2,
    isPro: Number(user.is_pro ?? 0) > 0,
    proType: asNonEmptyString(String(user.pro_type ?? "")),
    canBoostPosts: Number(user.can_boost_posts ?? 0) > 0,
    canBoostPages: Number(user.can_boost_pages ?? 0) > 0,
    wallet: user.wallet,
    points: user.points !== undefined && user.points !== null
      ? Number(user.points)
      : undefined,
  }
})
