// English description: Returns phtml-compatible verification state for the current settings user.

import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type { SettingsVerificationState } from "../../../src/settings/domain/types/settings.types"

type BackendVerificationResponse = {
  api_status?: number | string
  data?: Record<string, unknown>
  errors?: {
    error_text?: string
  }
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1"

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0)

  return Number.isFinite(normalized) ? normalized : 0
}

export default defineEventHandler(async (event): Promise<SettingsVerificationState> => {
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).get<BackendVerificationResponse>("verification"),
    "Unable to load verification state.",
  )
  const data = asRecord(response.data)
  const user = asRecord(data.user)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const availableFeatures = Array.isArray(data.available_verified_features)
    ? data.available_verified_features.map((item) => {
        const feature = asRecord(item)

        return {
          key: asString(feature.key),
          label: asString(feature.label),
        }
      }).filter(feature => feature.label)
    : []
  const verified = asBoolean(data.verified)
  const pending = asBoolean(data.has_pending_request)

  return {
    profileType: asBoolean(data.is_shop) ? "shop" : "user",
    status: verified ? "verified" : pending ? "pending" : "none",
    isAdmin: asBoolean(data.is_admin),
    adminRedirectUrl: asString(data.admin_redirect_url) || "/admincp/s_requests",
    availableFeatures,
    user: {
      id: asNumber(user.id),
      name: asString(user.name) || asString(user.username) || "User",
      username: asString(user.username),
      avatar: resolveMediaUrl(asString(user.avatar)),
      profileUrl: asString(user.url),
    },
  }
})
