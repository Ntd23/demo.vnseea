import { createError, readBody } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

export default defineEventHandler(async (event) => {
  const body = await readBody<{ userId?: number }>(event)
  const userId = Number(body.userId)
  if (!Number.isInteger(userId) || userId <= 0) {
    throw createError({ statusCode: 422, statusMessage: "A valid userId is required." })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<{ api_status?: number | string, message?: string }, { user_id: number }>(
      backendRoutes.api.resendActivationCode,
      { user_id: userId },
    ),
    "Unable to resend the confirmation code.",
  )
  return { success: true, message: response.message || "A new confirmation code was sent." }
})
