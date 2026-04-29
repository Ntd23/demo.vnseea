import type { FetchOptions } from "ofetch"
import type { ApiQuery } from "../../domain/types/api.types"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface NuxtApiRequest<TBody = unknown> {
  method?: HttpMethod
  query?: ApiQuery
  body?: TBody
  headers?: HeadersInit
}

export function useNuxtApiClient() {
  const runtimeConfig = useRuntimeConfig()

  const client = $fetch.create({
    baseURL: runtimeConfig.public.apiBase,
    credentials: "include",
  })

  const request = async <TResponse, TBody = unknown>(
    endpoint: string,
    options: NuxtApiRequest<TBody> = {},
  ) => {
    const fetchOptions: FetchOptions<"json"> = {
      method: options.method ?? "GET",
      query: options.query,
      body: options.body,
      headers: options.headers,
    }

    return client<TResponse>(endpoint, fetchOptions)
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
