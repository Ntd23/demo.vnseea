// English description: Bridges settings point transfer requests to the PHP wallet points transfer handler.

import { createError } from "h3"
import { createBackendWebClient } from "../../utils/backend-web-client"

type BackendPointsTransferResponse = {
  status?: number | string
  message?: string
  recipient_id?: number | string
  recipient_name?: string
  sender_points?: number | string
  recipient_points?: number | string
  points?: number | string
  errors?: string[] | { error_text?: string }
}

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const errorMessage = (response: BackendPointsTransferResponse | null | undefined) => {
  if (Array.isArray(response?.errors)) return response.errors.join("\n")
  if (response?.errors && typeof response.errors === "object") return asString(response.errors.error_text)
  return asString(response?.message) || "Unable to transfer points."
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ recipientUserId?: number | string; points?: number | string; note?: string }>(event)
  const recipientUserId = Math.trunc(asNumber(body?.recipientUserId))
  const points = Math.trunc(asNumber(body?.points))

  if (recipientUserId < 1 || points < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid point transfer details.",
    })
  }

  const response = await createBackendWebClient(event).postForm<BackendPointsTransferResponse>(
    "wallet",
    {
      user_id: recipientUserId,
      points,
      note: body?.note,
    },
    { s: "send-points" },
  )
  const status = Number(response?.status ?? 0)

  if (status < 200 || status >= 300) {
    throw createError({
      statusCode: 400,
      statusMessage: errorMessage(response),
      data: response,
    })
  }

  return {
    success: true,
    message: asString(response.message),
    recipientId: asNumber(response.recipient_id),
    recipientName: asString(response.recipient_name),
    senderPoints: asNumber(response.sender_points),
    recipientPoints: asNumber(response.recipient_points),
    points: asNumber(response.points),
  }
})
