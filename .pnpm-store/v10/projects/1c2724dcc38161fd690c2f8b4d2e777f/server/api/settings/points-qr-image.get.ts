// English description: Generates the current user's receive-VNSEEA QR image inside the Nuxt API boundary.

import { createError, getQuery, setHeader } from "h3"
import { renderSVG } from "uqr"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const buildPointsQrPayload = (userId: string, points: number) =>
  `POINTS|to=${userId}${points > 0 ? `|points=${points}|amount=${points}` : ""}`

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const currentUser = await getBackendCurrentUser(event)
  const userId = asString(currentUser.user_id)
  const points = Math.trunc(asNumber(query.points))

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const svg = renderSVG(buildPointsQrPayload(userId, points), {
    border: 2,
    ecc: "Q",
    pixelSize: 8,
    whiteColor: "#ffffff",
    blackColor: "#111827",
  })

  setHeader(event, "Content-Type", "image/svg+xml; charset=utf-8")
  setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  setHeader(event, "Pragma", "no-cache")

  return svg
})
