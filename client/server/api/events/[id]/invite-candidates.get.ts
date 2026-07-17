// English description: Searches the current user's eligible event invite candidates through the backend API.

import { createError, getQuery } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { getBackendWebBaseUrl } from "../../../utils/backend-media-url"
import { mapEventInviteCandidate } from "../_shared"

type BackendInviteCandidatesResponse = {
  api_status?: number | string
  data?: Array<Record<string, unknown>>
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event) => {
  const eventId = Number(event.context.params?.id || 0)
  const query = String(getQuery(event).query || "").trim()

  if (eventId < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid event id is required.",
    })
  }

  if (query.length < 2) {
    return []
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<BackendInviteCandidatesResponse, Record<string, unknown>>("events", {
      type: "search_invitees",
      event_id: eventId,
      filter: query,
      limit: 10,
    }),
    "Unable to search event invite candidates.",
  )
  const baseUrl = getBackendWebBaseUrl(event)

  return (response.data ?? [])
    .map((candidate) => mapEventInviteCandidate(candidate, baseUrl))
    .filter((candidate) => candidate.id > 0)
})
