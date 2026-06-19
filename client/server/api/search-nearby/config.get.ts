// English description: Returns public nearby search feature flags sourced from PHP admin settings.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendSiteSettingsResponse = {
  api_status?: number | string
  public_config?: Record<string, unknown>
  errors?: {
    error_text?: string
  }
}

export type SearchNearbyConfigResponse = {
  googlePlacesEnabled: boolean
}

const isDisabled = (value: unknown) =>
  value === false
  || value === 0
  || value === "0"
  || value === "false"

export default defineEventHandler(async (event): Promise<SearchNearbyConfigResponse> => {
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSiteSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.siteSettings,
      {},
    ),
    "Unable to load nearby search settings.",
  )

  return {
    googlePlacesEnabled: !isDisabled(response.public_config?.search_nearby_google_places),
  }
})
