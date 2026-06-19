// English description: Returns a backend generated receive-points QR image URL for the current user.

import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { getBackendBaseCandidates } from "../../utils/backend-api-client"
import { getBackendWebBaseUrl } from "../../utils/backend-media-url"

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const currentUser = await getBackendCurrentUser(event)
  const baseUrl = getBackendBaseCandidates(getBackendWebBaseUrl(event))[0] ?? getBackendWebBaseUrl(event)
  const points = Math.trunc(asNumber(query.points))
  const params = new URLSearchParams({
    f: "qrcode",
    s: "points-qr-code",
    to: String(currentUser.user_id ?? ""),
  })

  if (points > 0) {
    params.set("points", String(points))
  }

  return {
    imageUrl: `${baseUrl.replace(/\/+$/, "")}/requests.php?${params.toString()}`,
    points: points > 0 ? points : null,
  }
})
