// English description: Runs backend-backed profile actions such as follow without frontend mock state.

import { createError, readBody } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { ProfileActionResult } from "../../../src/profile/domain/types/profile.types"

type ProfileActionBody = {
  action?: string
  userId?: number | string
}

type BackendFollowResponse = {
  api_status?: number | string
  follow_status?: string
  errors?: {
    error_text?: string
  }
}

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

export default defineEventHandler(async (event): Promise<ProfileActionResult> => {
  const body = await readBody<ProfileActionBody>(event)
  const userId = asNumber(body.userId)

  if (body.action !== "follow") {
    throw createError({
      statusCode: 400,
      statusMessage: "Unsupported profile action.",
    })
  }

  if (userId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Profile user id is required.",
    })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendFollowResponse, Record<string, unknown>>(
      "follow-user",
      {
        user_id: userId,
      },
    ),
    "Unable to update profile follow state.",
  )

  return {
    ok: true,
    status: response.follow_status || "updated",
  }
})
