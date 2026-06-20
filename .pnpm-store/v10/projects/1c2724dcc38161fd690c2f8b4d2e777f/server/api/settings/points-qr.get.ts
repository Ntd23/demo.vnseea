// English description: Returns a backend generated receive-points QR image URL for the current user.

import { getBackendCurrentUser } from "../../utils/backend-current-user"

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  await getBackendCurrentUser(event)
  const points = Math.trunc(asNumber(query.points))
  const params = new URLSearchParams()

  if (points > 0) {
    params.set("points", String(points))
  }

  const queryString = params.toString()

  return {
    imageUrl: `/_api/settings/points-qr-image${queryString ? `?${queryString}` : ""}`,
    points: points > 0 ? points : null,
  }
})
