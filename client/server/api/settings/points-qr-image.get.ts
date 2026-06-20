// English description: Streams the backend receive-points QR PNG through the Nuxt API boundary.

import { createError, getQuery, setHeader } from "h3"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const buildBackendQrUrl = (baseUrl: string, userId: string, points: number) => {
  const params = new URLSearchParams({
    f: "qrcode",
    s: "points-qr-code",
    to: userId,
  })

  if (points > 0) {
    params.set("points", String(points))
  }

  return `${baseUrl.replace(/\/+$/, "")}/requests.php?${params.toString()}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const currentUser = await getBackendCurrentUser(event)
  const runtimeConfig = useRuntimeConfig(event)
  const userId = asString(currentUser.user_id)
  const points = Math.trunc(asNumber(query.points))
  const cookie = event.node.req.headers.cookie
  const candidates = getBackendBaseCandidates(
    String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
  )
  let lastError: unknown

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  for (const baseUrl of candidates) {
    try {
      const response = await $fetch.raw<ArrayBuffer>(buildBackendQrUrl(baseUrl, userId, points), {
        responseType: "arrayBuffer",
        headers: {
          accept: "image/png",
          ...(cookie ? { cookie } : {}),
        },
      })
      const contentType = response.headers.get("content-type") || ""

      if (!contentType.toLowerCase().includes("image/png")) {
        lastError = new Error(`Unexpected QR response content type: ${contentType || "unknown"}`)
        continue
      }

      const image = response._data

      if (!image || image.byteLength < 1) {
        lastError = new Error("Empty QR image response.")
        continue
      }

      setHeader(event, "Content-Type", "image/png")
      setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
      setHeader(event, "Pragma", "no-cache")

      return Buffer.from(image)
    }
    catch (error) {
      lastError = error
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: "Unable to generate VNSEEA QR image.",
    data: {
      cause: lastError instanceof Error ? lastError.message : String(lastError || ""),
    },
  })
})
