// English description: Returns backend advertising form options for Nuxt ads create and edit routes.

import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { fetchAdsOptions } from "./_shared"

export default defineEventHandler(async (event) => {
  await getBackendCurrentUser(event)

  return await fetchAdsOptions(event)
})
