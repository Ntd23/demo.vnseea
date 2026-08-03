// English description: Stores the current authenticated user while preserving valid sessions during transient backend failures.

import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useCookie } from "#app"
import type { CurrentAuthUser } from "../../domain/types/auth.types"
import { createApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository"

type RequestErrorLike = {
  status?: unknown
  statusCode?: unknown
  response?: {
    status?: unknown
  }
}

const getRequestStatusCode = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return 0
  }

  const requestError = error as RequestErrorLike
  const statusCode = Number(
    requestError.statusCode
      ?? requestError.status
      ?? requestError.response?.status
      ?? 0,
  )

  return Number.isFinite(statusCode) ? statusCode : 0
}

export const useCurrentAuthUserStore = defineStore("current-auth-user", () => {
  const user = ref<CurrentAuthUser | null>(null)
  const loading = ref(false)
  const hydrated = ref(false)
  const sessionRejected = ref(false)
  const lastHydrationStatus = ref<number | null>(null)

  async function hydrate(force = false) {
    if (loading.value) {
      return user.value
    }

    if (hydrated.value && !force) {
      return user.value
    }

    loading.value = true

    try {
      const backendSession = useCookie<string | null>("user_id", {
        default: () => null,
        sameSite: "lax",
        path: "/",
      })

      if (!backendSession.value) {
        user.value = null
        hydrated.value = true
        sessionRejected.value = true
        lastHydrationStatus.value = 401
        return null
      }

      const repository = createApiAuthRepository()
      const currentUser = await repository.getCurrentUser()

      if (!currentUser) {
        user.value = null
        hydrated.value = true
        sessionRejected.value = true
        lastHydrationStatus.value = 401
        return null
      }

      user.value = currentUser
      hydrated.value = true
      sessionRejected.value = false
      lastHydrationStatus.value = null

      return user.value
    }
    catch (error) {
      const statusCode = getRequestStatusCode(error)
      const isRejected = statusCode === 401

      sessionRejected.value = isRejected
      lastHydrationStatus.value = statusCode || null
      hydrated.value = isRejected

      if (isRejected) {
        user.value = null
      }

      return user.value
    }
    finally {
      loading.value = false
    }
  }

  function clear() {
    user.value = null
    hydrated.value = false
    loading.value = false
    sessionRejected.value = false
    lastHydrationStatus.value = null
  }

  function setPointsBalance(points: number) {
    if (!user.value || !Number.isFinite(points)) {
      return
    }

    user.value = {
      ...user.value,
      points: Math.max(Math.trunc(points), 0),
    }
  }

  function bustAvatarCache() {
    const avatarUrl = user.value?.avatarUrl
    if (!avatarUrl) {
      return
    }

    user.value = {
      ...user.value,
      avatarUrl: `${avatarUrl}${avatarUrl.includes("?") ? "&" : "?"}_v=${Date.now()}`,
    }
  }

  const isAdmin = computed(() => user.value?.isAdmin === true)
  const isModerator = computed(() => user.value?.isModerator === true)

  return {
    user,
    loading,
    hydrated,
    sessionRejected,
    lastHydrationStatus,
    isAdmin,
    isModerator,
    hydrate,
    setPointsBalance,
    bustAvatarCache,
    clear,
  }
})
