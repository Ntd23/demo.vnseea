import { createError, readBody } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendUpdateSettingsResponse = {
  api_status?: number | string
  type?: string
  message?: string
  errors?: {
    error_text?: string
  }
}

type SettingsUpdateBody = Record<string, string | number | boolean | null | undefined>

const allowedKeys = new Set([
  "username",
  "email",
  "phone_number",
  "gender",
  "birthday",
  "country_id",
  "website",
  "about",
  "current_password",
  "new_password",
])

export default defineEventHandler(async (event) => {
  const body = await readBody<SettingsUpdateBody>(event)
  const payload: SettingsUpdateBody = {}

  for (const [key, value] of Object.entries(body || {})) {
    if (allowedKeys.has(key)) {
      payload[key] = value
    }
  }

  if (Object.keys(payload).length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: "No supported settings fields were provided.",
    })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendUpdateSettingsResponse, SettingsUpdateBody>(
      backendRoutes.api.updateUserData,
      payload,
    ),
    "Unable to update settings.",
  )

  return {
    success: true,
    status: response.type || "updated",
    message: response.message || "Settings updated successfully.",
  }
})
