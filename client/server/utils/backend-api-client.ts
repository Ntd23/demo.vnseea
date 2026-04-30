import { createError, type H3Event } from "h3"
import type { ApiQuery } from "../../src/shared-kernel/domain/types/api.types"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface LegacyPhpRequest<TBody = unknown> {
  method?: HttpMethod
  query?: ApiQuery
  body?: TBody
  headers?: HeadersInit
}

const normalizeEndpointType = (endpoint: string) =>
  endpoint.endsWith(".php") ? endpoint.slice(0, -4) : endpoint

export const normalizeBackendBaseURL = (value: string) => {
  const normalized = value.trim().replace(/\/+$/, "")

  return normalized
    .replace(/\/api\/v2\/endpoints$/i, "")
    .replace(/\/api-v2\.php$/i, "")
}

export const getBackendBaseCandidates = (value: string) => {
  const normalized = normalizeBackendBaseURL(value)
  const candidates = new Set<string>([normalized])

  try {
    const url = new URL(normalized)

    if (url.hostname.endsWith(".test")) {
      candidates.add(`http://${url.hostname}:8080`)
      candidates.add(`https://${url.hostname}:8443`)
    }
  }
  catch {
    // Ignore invalid URLs here; the fetch layer will surface the real error.
  }

  return [...candidates]
}

const toLegacyBody = (body: unknown) => {
  if (!body || typeof body !== "object" || body instanceof FormData || body instanceof URLSearchParams) {
    return body
  }

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (value === undefined || value === null) {
      continue
    }

    params.append(key, String(value))
  }

  return params
}

export function createBackendApiClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  if (!runtimeConfig.backendApiBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing backendApiBase runtime config",
    })
  }

  if (!runtimeConfig.backendServerKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing backendServerKey runtime config",
    })
  }

  const forwardedHeaders: HeadersInit = {}

  const cookie = event.node.req.headers.cookie
  const authorization = event.node.req.headers.authorization

  if (cookie) {
    forwardedHeaders.cookie = cookie
  }

  if (authorization) {
    forwardedHeaders.authorization = authorization
  }

  const request = async <TResponse, TBody = unknown>(
    endpoint: string,
    options: LegacyPhpRequest<TBody> = {},
  ) => {
    const requestBody = toLegacyBody(options.body)
    const bodyWithServerKey = new URLSearchParams(
      requestBody instanceof URLSearchParams ? requestBody : undefined,
    )

    bodyWithServerKey.set("server_key", String(runtimeConfig.backendServerKey))
    const baseCandidates = getBackendBaseCandidates(String(runtimeConfig.backendApiBase))
    let lastError: unknown

    for (const baseURL of baseCandidates) {
      const client = $fetch.create({
        baseURL,
        credentials: "include",
        headers: forwardedHeaders,
      })

      try {
        return await client<TResponse>(`api/${normalizeEndpointType(endpoint)}`, {
          method: options.method ?? "GET",
          query: options.query,
          body: bodyWithServerKey,
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
    get: <TResponse>(endpoint: string, query?: ApiQuery) =>
      request<TResponse>(endpoint, { method: "GET", query }),
    post: <TResponse, TBody = unknown>(endpoint: string, body?: TBody, query?: ApiQuery) =>
      request<TResponse, TBody>(endpoint, { method: "POST", body, query }),
    put: <TResponse, TBody = unknown>(endpoint: string, body?: TBody, query?: ApiQuery) =>
      request<TResponse, TBody>(endpoint, { method: "PUT", body, query }),
    patch: <TResponse, TBody = unknown>(endpoint: string, body?: TBody, query?: ApiQuery) =>
      request<TResponse, TBody>(endpoint, { method: "PATCH", body, query }),
    delete: <TResponse>(endpoint: string, query?: ApiQuery) =>
      request<TResponse>(endpoint, { method: "DELETE", query }),
  }
}
