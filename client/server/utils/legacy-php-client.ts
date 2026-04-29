import { createError, type H3Event } from "h3"
import type { ApiQuery } from "../../src/shared-kernel/domain/types/api.types"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface LegacyPhpRequest<TBody = unknown> {
  method?: HttpMethod
  query?: ApiQuery
  body?: TBody
  headers?: HeadersInit
}

const normalizeEndpointName = (endpoint: string) =>
  endpoint.endsWith(".php") ? endpoint : `${endpoint}.php`

export function createLegacyPhpClient(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  if (!runtimeConfig.legacyApiBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing legacyApiBase runtime config",
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

  const client = $fetch.create({
    baseURL: runtimeConfig.legacyApiBase,
    credentials: "include",
    headers: forwardedHeaders,
  })

  const request = async <TResponse, TBody = unknown>(
    endpoint: string,
    options: LegacyPhpRequest<TBody> = {},
  ) => {
    return client<TResponse>(normalizeEndpointName(endpoint), {
      method: options.method ?? "GET",
      query: options.query,
      body: options.body,
      headers: options.headers,
    })
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
