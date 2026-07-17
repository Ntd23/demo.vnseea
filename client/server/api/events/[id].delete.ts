// English description: Deletes an owner-managed event through the existing backend API operation.

import { createError } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { fetchEventDetail } from "./_shared"

type BackendDeleteEventResponse = {
  api_status?: number | string
  message_data?: string
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event) => {
  const eventId = Number(event.context.params?.id || 0)
  if (eventId < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid event id is required.",
    })
  }

  const existingEvent = await fetchEventDetail(event, eventId)
  if (!existingEvent.isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only the event owner can delete this event.",
    })
  }

  assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendDeleteEventResponse, Record<string, unknown>>("events", {
      type: "delete",
      event_id: eventId,
    }),
    "Unable to delete event.",
  )

  return { success: true }
})
