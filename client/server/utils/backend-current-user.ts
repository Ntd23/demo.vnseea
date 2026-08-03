// English description: Resolves the current backend-authenticated user from the PHP browser session.

import { createError, getCookie, type H3Event } from "h3"
import { backendRoutes } from "../../src/shared-kernel/application/constants/route-registry"
import { getBackendBaseCandidates } from "./backend-api-client"
import { parseBackendApiResponse } from "./backend-api-response"
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

type BackendCurrentUserOptions = {
  clearCookieOnRejectedSession?: boolean
}

const asBackendResponse = (value: unknown): BackendCurrentUserResponse | null => {
  const parsed = parseBackendApiResponse<unknown>(value)

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null
  }

  return parsed as BackendCurrentUserResponse
}

const summarizeBackendResponse = (response: unknown) => {
  const parsed = asBackendResponse(response)

  return {
    responseType: Array.isArray(response) ? "array" : typeof response,
    apiStatus: Number(parsed?.api_status ?? 0) || null,
    responseKeys: parsed ? Object.keys(parsed).slice(0, 12) : [],
    hasUserData: Boolean(parsed?.user_data),
    hasUserId: Boolean(parsed?.user_data?.user_id),
    backendError: parsed?.errors?.error_text || "",
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

const getRequestResponse = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return null
  }

  const requestError = error as RequestErrorLike
  return asBackendResponse(requestError.data ?? requestError.response?._data)
}

const isRejectedSession = (response: BackendCurrentUserResponse | null) =>
  Number(response?.api_status ?? 0) === 401

const rejectSession = (
  event: H3Event,
  data?: unknown,
  clearCookie = true,
): never => {
  if (clearCookie) {
    clearBackendSessionCookie(event)
  }

  throw createError({
    statusCode: 401,
    statusMessage: "Authentication is required.",
    data,
  })
}

export async function getBackendCurrentUser(
  event: H3Event,
  options: BackendCurrentUserOptions = {},
) {
  const userSession = getCookie(event, "user_id")
  const clearCookieOnRejectedSession = options.clearCookieOnRejectedSession !== false

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
  let invalidResponse: unknown = null
  let rejectedResponse: BackendCurrentUserResponse | null = null

  const configuredBaseURLs = [
    String(runtimeConfig.backendApiBase || ""),
    String(runtimeConfig.public.backendWebBase || ""),
  ].filter(Boolean)
  const baseURLs = Array.from(new Set(
    configuredBaseURLs.flatMap(getBackendBaseCandidates),
  ))

  for (const baseURL of baseURLs) {
    try {
      const rawResponse = await $fetch<unknown>(
        backendRoutes.session.currentUser(userSession),
        {
          baseURL,
          cache: "no-store",
          credentials: "include",
          headers: {
            accept: "application/json",
            ...(cookie ? { cookie } : {}),
          },
        },
      )
      const parsedResponse = asBackendResponse(rawResponse)

      if (isRejectedSession(parsedResponse)) {
        rejectedResponse = parsedResponse
        continue
      }

      const status = Number(parsedResponse?.api_status ?? 0)
      if (
        parsedResponse
        && status >= 200
        && status < 300
        && parsedResponse.user_data?.user_id
      ) {
        currentUserResponse = parsedResponse
        break
      }

      invalidResponse = rawResponse
    }
    catch (error) {
      const errorResponse = getRequestResponse(error)

      if (getRequestStatusCode(error) === 401 || isRejectedSession(errorResponse)) {
        rejectedResponse = errorResponse || {
          api_status: 401,
        }
        continue
      }

      lastError = error
      currentUserResponse = null
    }
  }

  if (!currentUserResponse) {
    if (rejectedResponse && invalidResponse === null && lastError === null) {
      rejectSession(event, rejectedResponse, clearCookieOnRejectedSession)
    }

    if (invalidResponse !== null) {
      const diagnostic = summarizeBackendResponse(invalidResponse)
      console.error("[auth/current-user] Invalid backend response", diagnostic)

      throw createError({
        statusCode: 502,
        statusMessage: "The backend returned an invalid authentication response.",
        data: diagnostic,
      })
    }

    throw createError({
      statusCode: 502,
      statusMessage: "Unable to verify authentication with the backend.",
      data: getRequestResponse(lastError),
    })
  }

  return currentUserResponse.user_data!
}
