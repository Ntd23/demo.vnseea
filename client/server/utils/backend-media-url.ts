// English description: Resolves backend media paths into absolute URLs that are safe to render through Nuxt image components.

import type { H3Event } from "h3"

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const stripBackendApiSuffix = (value: string) =>
  value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v2\/endpoints$/i, "")
    .replace(/\/api-v2\.php$/i, "")
    .replace(/\/api$/i, "")

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

export const getBackendWebBaseUrl = (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const rawBase = asString(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase)

  return trimTrailingSlash(stripBackendApiSuffix(rawBase))
}

export const createBackendMediaUrlResolver = (event: H3Event) => {
  const backendWebBase = getBackendWebBaseUrl(event)

  return (value: unknown) => {
    const rawValue = asString(value)

    if (!rawValue) {
      return ""
    }

    if (/^(?:data:|blob:|https?:\/\/)/i.test(rawValue)) {
      return rawValue
    }

    if (!backendWebBase) {
      return rawValue.startsWith("/") ? rawValue : `/${rawValue}`
    }

    if (rawValue.startsWith("//")) {
      return `${new URL(backendWebBase).protocol}${rawValue}`
    }

    try {
      return new URL(rawValue, `${backendWebBase}/`).toString()
    }
    catch {
      return rawValue
    }
  }
}
