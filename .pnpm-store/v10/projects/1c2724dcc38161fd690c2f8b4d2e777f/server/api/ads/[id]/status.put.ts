// English description: Updates a backend advertising campaign status for the current user.

import { getRouterParam, readBody } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../../utils/backend-current-user"
import type { AdsMutationResult } from "../../../../src/ads/domain/types/ads.types"

type BackendAdsResponse = {
  api_status?: number | string
  message?: string
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event): Promise<AdsMutationResult> => {
  await getBackendCurrentUser(event)

  const body = await readBody<{ status?: string }>(event)
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendAdsResponse>("ads", {
      type: "update_status",
      ad_id: Number(getRouterParam(event, "id")),
      status: body.status === "active" ? 1 : 0,
    }),
    "Unable to update advertising campaign status.",
  )

  return {
    success: true,
    message: response.message || "Advertising campaign status updated.",
  }
})
