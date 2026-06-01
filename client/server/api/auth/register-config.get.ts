// English description: Returns public backend registration settings needed to mirror the PHP register form.

import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type { RegisterAccountConfig } from "../../../src/auth/domain/types/auth.types"

type BackendSiteSettingsResponse = {
  api_status?: number | string
  public_config?: Record<string, unknown>
  errors?: {
    error_text?: string
  }
}

const isEnabled = (value: unknown) =>
  value === true
  || value === 1
  || value === "1"
  || value === "true"

export default defineEventHandler(async (event): Promise<RegisterAccountConfig> => {
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSiteSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.siteSettings,
      {},
    ),
    "Unable to load registration settings.",
  )

  return {
    autoUsername: isEnabled(response.public_config?.auto_username),
  }
})
