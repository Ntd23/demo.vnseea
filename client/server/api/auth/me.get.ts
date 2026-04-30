import { getCookie } from "h3"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import type { CurrentAuthUser } from "../../../src/auth/domain/types/auth.types"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendCurrentUserPayload = {
  user_id?: number | string
  name?: string
  username?: string
  avatar?: string
  admin?: number | string
  wallet?: number | string
  points?: number | string
}

type BackendCurrentUserResponse = {
  api_status?: number | string
  user_data?: BackendCurrentUserPayload
}

const asNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

export default defineEventHandler(async (event): Promise<CurrentAuthUser | null> => {
  const backendUserSession = getCookie(event, "user_id")

  if (!backendUserSession) {
    return null
  }
  const runtimeConfig = useRuntimeConfig(event)
  const cookie = event.node.req.headers.cookie

  try {
    const baseCandidates = getBackendBaseCandidates(
      String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
    )
    let response: BackendCurrentUserResponse | null = null

    for (const baseURL of baseCandidates) {
      try {
        response = await $fetch<BackendCurrentUserResponse>(backendRoutes.session.currentUser(backendUserSession), {
          baseURL,
          headers: cookie ? { cookie } : undefined,
          credentials: "include",
        })
        break
      }
      catch {
        response = null
      }
    }

    const apiStatus = Number(response?.api_status ?? 0)
    const user = response?.user_data

    if (apiStatus < 200 || apiStatus >= 300 || !user?.user_id || !user.name) {
      return null
    }

    return {
      id: Number(user.user_id),
      name: asNonEmptyString(user.name) || "User",
      username: asNonEmptyString(user.username),
      avatarUrl: asNonEmptyString(user.avatar),
      isAdmin: Number(user.admin ?? 0) === 1,
      wallet: user.wallet,
      points: user.points !== undefined && user.points !== null
        ? Number(user.points)
        : undefined,
    }
  }
  catch {
    return null
  }
})
