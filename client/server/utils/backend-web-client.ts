// English description: Server-side client for PHP browser-session form handlers such as requests.php.

import { createError, type H3Event } from "h3"
import type { ApiQuery } from "../../src/shared-kernel/domain/types/api.types"
import { backendRoutes } from "../../src/shared-kernel/application/constants/route-registry"
import { getBackendBaseCandidates } from "./backend-api-client"

type BackendWebFormValue = string | number | boolean | null | undefined
type BackendWebFormBody = Record<string, BackendWebFormValue>

export interface BackendWebRequest<TBody = BackendWebFormBody> {
  query?: ApiQuery
  body?: TBody
  headers?: HeadersInit
}

const toFormBody = (body: unknown) => {
  if (body instanceof URLSearchParams || body instanceof FormData) {
    return body
  }

  const params = new URLSearchParams()

  if (!body || typeof body !== "object") {
    return params
  }

  for (const [key, value] of Object.entries(body as BackendWebFormBody)) {
    if (value === undefined || value === null) {
      continue
    }

    params.append(key, String(value))
  }

  return params
}

export function createBackendWebClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  if (!runtimeConfig.backendApiBase && !runtimeConfig.public.backendWebBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing backend web runtime config",
    })
  }

  const forwardedHeaders: HeadersInit = {
    "X-Requested-With": "XMLHttpRequest",
  }

  const cookie = event.node.req.headers.cookie
  const authorization = event.node.req.headers.authorization

  if (cookie) {
    forwardedHeaders.cookie = cookie
  }

  if (authorization) {
    forwardedHeaders.authorization = authorization
  }

  const request = async <TResponse, TBody = BackendWebFormBody>(
    options: BackendWebRequest<TBody> = {},
  ) => {
    const baseCandidates = getBackendBaseCandidates(
      String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
    )
    let lastError: unknown

    for (const baseURL of baseCandidates) {
      const client = $fetch.create({
        baseURL,
        credentials: "include",
        headers: forwardedHeaders,
      })

      try {
        return await client<TResponse>(backendRoutes.web.requests, {
          method: "POST",
          query: options.query,
          body: toFormBody(options.body),
          headers: options.headers,
        })
      }
      catch (error) {
        lastError = error
      }
    }

    throw lastError
  }

  return {
    request,
    postForm: <TResponse, TBody = BackendWebFormBody>(
      action: string,
      body?: TBody,
      query?: ApiQuery,
    ) => request<TResponse, TBody>({
      query: {
        ...(query ?? {}),
        f: action,
      },
      body,
    }),
  }
}
