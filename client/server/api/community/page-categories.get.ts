import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendSiteSettingsResponse = {
  api_status?: number | string
  page_categories?: Record<string, string>
}

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSiteSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.siteSettings,
      {},
    ),
    "Unable to load page categories.",
  )

  const rawCategories = response.page_categories ?? {}

  return Object.entries(rawCategories).map(([id, name]) => ({
    value: id,
    label: name,
  }))
})
