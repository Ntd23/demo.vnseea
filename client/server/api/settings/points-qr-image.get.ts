// English description: Streams the backend receive-points QR PNG through the Nuxt API boundary.

import { createError, getQuery, setHeader } from "h3"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

const parseOptionalPoints = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null
  const normalized = Array.isArray(value) ? value[0] : value
  if (typeof normalized !== "string" || !/^[1-9][0-9]*$/.test(normalized)) return undefined
  const number = Number(normalized)
  return Number.isSafeInteger(number) && number <= 2147483647 ? number : undefined
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const qrImageCache = new Map<string, { image: Buffer, expiresAt: number }>()
const qrCacheTtlMs = 10 * 60 * 1000
const maxQrCacheEntries = 200

const setQrResponseHeaders = (event: Parameters<typeof setHeader>[0]) => {
  setHeader(event, "Content-Type", "image/png")
  setHeader(event, "Cache-Control", "private, max-age=60, stale-if-error=600")
  setHeader(event, "Pragma", "no-cache")
}

const rememberQrImage = (key: string, image: Buffer) => {
  if (qrImageCache.size >= maxQrCacheEntries) {
    const oldestKey = qrImageCache.keys().next().value
    if (oldestKey) qrImageCache.delete(oldestKey)
  }

  qrImageCache.set(key, { image, expiresAt: Date.now() + qrCacheTtlMs })
}

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
  const points = parseOptionalPoints(query.points)
  const cookie = event.node.req.headers.cookie
  const candidates = getBackendBaseCandidates(
    String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase),
  )
  let lastError: unknown

  if (points === undefined) {
    throw createError({ statusCode: 400, statusMessage: "VNSEEA must be a positive integer." })
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const cacheKey = `${userId}:${points || 0}`
  const cached = qrImageCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    setQrResponseHeaders(event)
    return cached.image
  }
  if (cached) qrImageCache.delete(cacheKey)

  for (const baseUrl of candidates) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await $fetch.raw<ArrayBuffer>(buildBackendQrUrl(baseUrl, userId, points || 0), {
          responseType: "arrayBuffer",
          retry: 0,
          timeout: 7000,
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

        const imageBuffer = Buffer.from(image)
        rememberQrImage(cacheKey, imageBuffer)
        setQrResponseHeaders(event)
        return imageBuffer
      }
      catch (error) {
        lastError = error
      }
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
