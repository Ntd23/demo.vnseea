// English description: Returns a single backend advertising campaign for Nuxt ads edit routes.

import { getRouterParam } from "h3"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { fetchAdsCampaign } from "./_shared"

export default defineEventHandler(async (event) => {
  await getBackendCurrentUser(event)

  return await fetchAdsCampaign(event, Number(getRouterParam(event, "id")))
})
