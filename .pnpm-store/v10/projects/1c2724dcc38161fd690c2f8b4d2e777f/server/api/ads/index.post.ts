// English description: Creates a backend advertising campaign from the Nuxt ads creation form.

import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { readAdsMultipartDraft, submitAdsCampaign } from "./_shared"

export default defineEventHandler(async (event) => {
  await getBackendCurrentUser(event)

  return await submitAdsCampaign(event, await readAdsMultipartDraft(event, "create"))
})
