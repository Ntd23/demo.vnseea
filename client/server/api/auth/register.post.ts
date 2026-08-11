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

function buildOptionalBirthday(body: RegisterAccountInput) {
  const parts = [body.birthYear, body.birthMonth, body.birthDay]
  if (parts.every(value => value === null || value === undefined)) {
    return undefined
  }

  if (parts.some(value => value === null || value === undefined)) {
    throw createError({
      statusCode: 422,
      statusMessage: "Birthday is incomplete.",
    })
  }

  const year = Number(body.birthYear)
  const month = Number(body.birthMonth)
  const day = Number(body.birthDay)
  const date = new Date(Date.UTC(year, month - 1, day))
  const isValid = Number.isInteger(year)
    && Number.isInteger(month)
    && Number.isInteger(day)
    && year >= 1900
    && year <= 3000
    && date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day

  if (!isValid) {
    throw createError({
      statusCode: 422,
      statusMessage: "Birthday is invalid.",
    })
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default defineEventHandler(async (event): Promise<RegisterAccountResult> => {
  const client = createBackendApiClient(event)
  const body = await readBody<RegisterAccountInput>(event)
  const identity = body.email?.trim() ?? ""
  const firstName = body.firstName?.trim() ?? ""
  const lastName = body.lastName?.trim() ?? ""
  const digitsOnly = identity.replace(/\D/g, "")
  const isEmailIdentity = identity.includes("@")
  const email = isEmailIdentity ? identity : ""
  const phoneNum = !isEmailIdentity && digitsOnly ? digitsOnly : ""

  if (!identity) {
    throw createError({
      statusCode: 422,
      statusMessage: "Email or phone number is required.",
    })
  }

  if (!firstName) {
    throw createError({
      statusCode: 422,
      statusMessage: "User name is required.",
    })
  }

  const response = assertBackendApiSuccess(
    await client.post<BackendRegisterResponse, Record<string, unknown>>(backendRoutes.api.createAccount, {
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      email,
      phone_num: phoneNum || undefined,
      password: body.password,
      confirm_password: body.confirmPassword,
      gender: body.gender || "male",
      birthday: buildOptionalBirthday(body),
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
