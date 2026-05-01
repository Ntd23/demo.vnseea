import { createError, getCookie } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendSettingsUser = Record<string, unknown>

type BackendSettingsResponse = {
  api_status?: number | string
  user_data?: BackendSettingsUser
  errors?: {
    error_text?: string
  }
}

export type SettingsMeResponse = {
  id: number
  name: string
  username?: string
  email?: string
  phone?: string
  gender?: string
  birthday?: string
  countryId?: string
  website?: string
  about?: string
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : undefined

export default defineEventHandler(async (event): Promise<SettingsMeResponse> => {
  const userSession = getCookie(event, "user_id")

  if (!userSession) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.userData,
      {
        user_id: userSession,
        fetch: "user_data",
      },
    ),
    "Unable to load settings user data.",
  )

  const user = response.user_data

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Current user was not found.",
    })
  }

  return {
    id: Number(user.user_id ?? user.id ?? userSession),
    name: asString(user.name) || asString(user.username) || "User",
    username: asString(user.username),
    email: asString(user.email),
    phone: asString(user.phone_number),
    gender: asString(user.gender),
    birthday: asString(user.birthday),
    countryId: asString(user.country_id),
    website: asString(user.website),
    about: asString(user.about),
  }
})
