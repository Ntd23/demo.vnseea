// English description: Resolves the current backend-authenticated user from the PHP browser session.

import { createError, getCookie, type H3Event } from "h3"
import { backendRoutes } from "../../src/shared-kernel/application/constants/route-registry"
import { getBackendBaseCandidates } from "./backend-api-client"
import { clearBackendSessionCookie } from "./backend-session-cookie"

export type BackendCurrentUserData = Record<string, unknown> & {
  user_id?: number | string
  session_hash?: string
}

type BackendCurrentUserResponse = {
  api_status?: number | string
  user_data?: BackendCurrentUserData
  errors?: {
    error_text?: string
  }
}

type RequestErrorLike = {
  status?: unknown
  statusCode?: unknown
  data?: unknown
  response?: {
    status?: unknown
    _data?: unknown
  }
}

const asBackendResponse = (value: unknown): BackendCurrentUserResponse | null => {
  if (!value || typeof value !== "object") {
    return null
  }

  return value as BackendCurrentUserResponse
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

const getRequestResponse = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return null
  }

  const requestError = error as RequestErrorLike
  return asBackendResponse(requestError.data ?? requestError.response?._data)
}

const isRejectedSession = (response: BackendCurrentUserResponse | null) =>
  Number(response?.api_status ?? 0) === 401

const rejectSession = (event: H3Event, data?: unknown): never => {
  clearBackendSessionCookie(event)

  throw createError({
    statusCode: 401,
    statusMessage: "Authentication is required.",
    data,
  })
}

export async function getBackendCurrentUser(event: H3Event) {
  const userSession = getCookie(event, "user_id")

  if (!userSession) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const cookie = event.node.req.headers.cookie
  let currentUserResponse: BackendCurrentUserResponse | null = null
  let lastError: unknown = null

  for (const baseURL of getBackendBaseCandidates(
    String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
  )) {
    try {
      currentUserResponse = await $fetch<BackendCurrentUserResponse>(
        backendRoutes.session.currentUser(userSession),
        {
          baseURL,
          credentials: "include",
          headers: cookie ? { cookie } : undefined,
        },
      )
      break
    }
    catch (error) {
      const errorResponse = getRequestResponse(error)

      if (getRequestStatusCode(error) === 401 || isRejectedSession(errorResponse)) {
        rejectSession(event, errorResponse)
      }

      lastError = error
      currentUserResponse = null
    }
  }

  if (!currentUserResponse) {
    throw createError({
      statusCode: 502,
      statusMessage: "Unable to verify authentication with the backend.",
      data: getRequestResponse(lastError),
    })
  }

  if (isRejectedSession(currentUserResponse)) {
    rejectSession(event, currentUserResponse)
  }

  const currentUser = currentUserResponse?.user_data
  const currentUserId = currentUser?.user_id
  const status = Number(currentUserResponse?.api_status ?? 0)

  if (status < 200 || status >= 300 || !currentUserId) {
    throw createError({
      statusCode: 502,
      statusMessage: "The backend returned an invalid authentication response.",
      data: currentUserResponse,
    })
  }

  return currentUser
}
