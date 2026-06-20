// English description: Bridges Nuxt registration requests to the backend account creation API.

import { readBody, createError } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import type { RegisterAccountInput, RegisterAccountResult } from "../../../src/auth/domain/types/auth.types"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendRegisterResponse = {
  api_status?: number | string
  access_token?: string
  user_id?: number | string
  user_platform?: string
  membership?: boolean
  message?: string
  errors?: {
    error_text?: string
  }
}

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

async function resolveAutoUsername(event: Parameters<typeof createBackendApiClient>[0]) {
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSiteSettingsResponse, Record<string, unknown>>(
      backendRoutes.api.siteSettings,
      {},
    ),
    "Unable to load registration settings.",
  )

  return isEnabled(response.public_config?.auto_username)
}

export default defineEventHandler(async (event): Promise<RegisterAccountResult> => {
  const client = createBackendApiClient(event)
  const body = await readBody<RegisterAccountInput>(event)
  const identity = body.email?.trim() ?? ""
  const username = body.username?.trim() ?? ""
  const firstName = body.firstName?.trim() ?? ""
  const lastName = body.lastName?.trim() ?? ""
  const autoUsername = await resolveAutoUsername(event)
  const digitsOnly = identity.replace(/\D/g, "")
  const isEmailIdentity = identity.includes("@")
  const email = isEmailIdentity ? identity : (digitsOnly ? `phone_${digitsOnly}@vnseea.invalid` : "")
  const phoneNum = !isEmailIdentity && digitsOnly ? digitsOnly : ""

  if (!identity) {
    throw createError({
      statusCode: 422,
      statusMessage: "Email or phone number is required.",
    })
  }

  if (!autoUsername && !username) {
    throw createError({
      statusCode: 422,
      statusMessage: "Username is required.",
    })
  }

  if (autoUsername && !firstName) {
    throw createError({
      statusCode: 422,
      statusMessage: "First name is required.",
    })
  }

  const response = assertBackendApiSuccess(
    await client.post<BackendRegisterResponse, Record<string, unknown>>(backendRoutes.api.createAccount, {
      username: autoUsername ? undefined : username,
      first_name: autoUsername ? firstName : undefined,
      last_name: autoUsername && lastName ? lastName : undefined,
      email,
      phone_num: phoneNum || undefined,
      password: body.password,
      confirm_password: body.confirmPassword,
      gender: body.gender || "male",
      ref: body.ref?.trim() || undefined,
    }),
    "Unable to create account.",
  )

  const apiStatus = Number(response.api_status ?? 0)
  const verificationRequired = apiStatus >= 220

  return {
    success: true,
    status: verificationRequired ? "verification_required" : "active",
    message: response.message
      ?? (verificationRequired
        ? "Registration succeeded. Please verify your account before signing in."
        : "Account created successfully."),
    accessToken: response.access_token,
    userId: response.user_id ? Number(response.user_id) : undefined,
    userPlatform: response.user_platform,
    membershipRequired: response.membership ?? false,
  }
})
