// English description: Returns a backend generated receive-points QR image URL for the current user.

import { createError } from "h3"
import { getBackendCurrentUser } from "../../utils/backend-current-user"

const parseOptionalPoints = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null
  const normalized = Array.isArray(value) ? value[0] : value
  if (typeof normalized !== "string" || !/^[1-9][0-9]*$/.test(normalized)) return undefined
  const number = Number(normalized)
  return Number.isSafeInteger(number) && number <= 2147483647 ? number : undefined
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  await getBackendCurrentUser(event)
  const points = parseOptionalPoints(query.points)
  const params = new URLSearchParams()

  if (points === undefined) {
    throw createError({statusCode: 400, statusMessage: "VNSEEA must be a positive integer."})
  }

  if (points) {
    params.set("points", String(points))
  }

  const queryString = params.toString()

  return {
    imageUrl: `/_api/settings/points-qr-image${queryString ? `?${queryString}` : ""}`,
    points,
  }
})
