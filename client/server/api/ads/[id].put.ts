// English description: Updates a backend advertising campaign from the Nuxt ads editing form.

import { getRouterParam } from "h3"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { readAdsMultipartDraft, submitAdsCampaign } from "./_shared"

export default defineEventHandler(async (event) => {
  await getBackendCurrentUser(event)

  const id = Number(getRouterParam(event, "id"))

  return await submitAdsCampaign(event, await readAdsMultipartDraft(event, "edit", id))
})
