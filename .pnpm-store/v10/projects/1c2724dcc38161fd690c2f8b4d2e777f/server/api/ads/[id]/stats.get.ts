// English description: Returns backend advertising analytics for a campaign chart route.

import { getRouterParam } from "h3"
import { getBackendCurrentUser } from "../../../utils/backend-current-user"
import { fetchAdsStats } from "../_shared"

export default defineEventHandler(async (event) => {
  await getBackendCurrentUser(event)

  return await fetchAdsStats(event, Number(getRouterParam(event, "id")))
})
