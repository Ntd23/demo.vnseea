// English description: Owns the persistent browser endpoint identity used by LiveKit leases.

import { randomUUID } from "node:crypto"
import { getCookie, setCookie, type H3Event } from "h3"

const ENDPOINT_COOKIE = "vnseea_endpoint_id"
const ENDPOINT_CONTEXT_KEY = "vnseeaClientEndpointId"
const ENDPOINT_PATTERN = /^[A-Za-z0-9._:-]{8,96}$/

function normalizeEndpointId(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : ""
  return ENDPOINT_PATTERN.test(normalized) ? normalized : ""
}

export function getOrCreateClientEndpointId(event: H3Event) {
  const context = event.context as Record<string, unknown>
  const cached = normalizeEndpointId(context[ENDPOINT_CONTEXT_KEY])
  if (cached) return cached

  const existing = normalizeEndpointId(getCookie(event, ENDPOINT_COOKIE))
  const endpointId = existing || `web_${randomUUID().replace(/-/g, "")}`
  context[ENDPOINT_CONTEXT_KEY] = endpointId

  if (!existing) {
    setCookie(event, ENDPOINT_COOKIE, endpointId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return endpointId
}
