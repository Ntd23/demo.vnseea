// English description: Sends an event invitation to one eligible backend follower.

import { createError, readBody } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { fetchEventDetail } from "../_shared"

type BackendInviteResponse = {
  api_status?: number | string
  message_data?: string
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event) => {
  const eventId = Number(event.context.params?.id || 0)
  const body = await readBody<{ userId?: string | number }>(event)
  const userId = Number(body.userId || 0)

  if (eventId < 1 || userId < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event id and user id are required.",
    })
  }

  await fetchEventDetail(event, eventId)

  assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendInviteResponse, Record<string, unknown>>("events", {
      type: "invite",
      event_id: eventId,
      user_id: userId,
    }),
    "Unable to send the event invitation.",
  )

  return { userId }
})
