// English description: Updates an owner-managed backend event, including an optional replacement cover image.

import { createError, getHeader, readBody, readMultipartFormData, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { postBackendApiUpload } from "../../utils/backend-api-upload"
import { fetchEventDetail } from "./_shared"

type BackendEditEventResponse = {
  api_status?: number | string
  message_data?: string
  errors?: {
    error_text?: string
  }
}

type UpdateEventPayload = {
  name: string
  location: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  coverFile: {
    filename?: string
    type?: string
    data: Buffer
  } | null
}

const emptyPayload = (): UpdateEventPayload => ({
  name: "",
  location: "",
  description: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  coverFile: null,
})

const parseJsonPayload = async (event: H3Event): Promise<UpdateEventPayload> => {
  const body = await readBody<Record<string, unknown>>(event)

  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    location: typeof body.location === "string" ? body.location.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : "",
    startDate: typeof body.startDate === "string" ? body.startDate.trim() : "",
    startTime: typeof body.startTime === "string" ? body.startTime.trim() : "",
    endDate: typeof body.endDate === "string" ? body.endDate.trim() : "",
    endTime: typeof body.endTime === "string" ? body.endTime.trim() : "",
    coverFile: null,
  }
}

const parseMultipartPayload = async (event: H3Event): Promise<UpdateEventPayload> => {
  const payload = emptyPayload()
  const parts = (await readMultipartFormData(event)) ?? []

  for (const part of parts) {
    if (!part.name) continue

    if (part.filename) {
      if (part.name === "coverFile") {
        payload.coverFile = {
          filename: part.filename,
          type: part.type,
          data: part.data,
        }
      }
      continue
    }

    const value = part.data.toString().trim()
    if (part.name === "name") payload.name = value
    if (part.name === "location") payload.location = value
    if (part.name === "description") payload.description = value
    if (part.name === "startDate") payload.startDate = value
    if (part.name === "startTime") payload.startTime = value
    if (part.name === "endDate") payload.endDate = value
    if (part.name === "endTime") payload.endTime = value
  }

  return payload
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
      statusMessage: "Only the event owner can edit this event.",
    })
  }

  const contentType = getHeader(event, "content-type") || ""
  const payload = contentType.includes("multipart/form-data")
    ? await parseMultipartPayload(event)
    : await parseJsonPayload(event)

  if (
    !payload.name ||
    !payload.location ||
    !payload.description ||
    !payload.startDate ||
    !payload.startTime ||
    !payload.endDate ||
    !payload.endTime
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Event fields are required.",
    })
  }

  const formData = new FormData()
  formData.append("type", "edit")
  formData.append("event_id", String(eventId))
  formData.append("event_name", payload.name)
  formData.append("event_location", payload.location)
  formData.append("event_description", payload.description)
  formData.append("event_start_date", payload.startDate)
  formData.append("event_start_time", payload.startTime)
  formData.append("event_end_date", payload.endDate)
  formData.append("event_end_time", payload.endTime)

  if (payload.coverFile) {
    const coverBytes = new Uint8Array(payload.coverFile.data.length)
    coverBytes.set(payload.coverFile.data)

    formData.append(
      "event-cover",
      new File([coverBytes], payload.coverFile.filename || "event-cover.jpg", {
        type: payload.coverFile.type || "image/jpeg",
      }),
    )
  }

  assertBackendApiSuccess(
    await postBackendApiUpload<BackendEditEventResponse>(event, "events", formData),
    "Unable to update event.",
  )

  return await fetchEventDetail(event, eventId)
})
