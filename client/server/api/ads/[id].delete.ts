// English description: Deletes a backend advertising campaign owned by the current user.

import { getRouterParam } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import type { AdsMutationResult } from "../../../src/ads/domain/types/ads.types"

type BackendAdsResponse = {
  api_status?: number | string
  message?: string
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event): Promise<AdsMutationResult> => {
  await getBackendCurrentUser(event)

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendAdsResponse>("ads", {
      type: "delete",
      ad_id: Number(getRouterParam(event, "id")),
    }),
    "Unable to delete advertising campaign.",
  )

  return {
    success: true,
    message: response.message || "Advertising campaign deleted.",
  }
})
