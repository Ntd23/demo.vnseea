// Bridges Nuxt VNSEEA transfers to the canonical idempotent API v2 endpoint.

import { createError, readBody } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"

type BackendPointsTransferResponse = {
  api_status?: number | string
  success?: boolean
  message?: string
  request_id?: string
  idempotent_replay?: boolean
  recipient_id?: number | string
  recipient_name?: string
  sender_points?: number | string
  recipient_points?: number | string
  points?: number | string
  sender_transaction_id?: number | string
  recipient_transaction_id?: number | string
  error_code?: string
  errors?: { error_text?: string }
}

const parsePositiveInteger = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 && value <= 2147483647 ? value : null
  }
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed <= 2147483647 ? parsed : null
}

const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    recipientUserId?: number | string
    points?: number | string
    requestId?: string
    note?: string
  }>(event)
  const recipientUserId = parsePositiveInteger(body?.recipientUserId)
  const points = parsePositiveInteger(body?.points)
  const requestId = asString(body?.requestId)
  const note = asString(body?.note).slice(0, 255)

  if (!recipientUserId || !points) {
    throw createError({statusCode: 400, statusMessage: "Recipient and VNSEEA must be positive integers."})
  }
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(requestId)) {
    throw createError({statusCode: 400, statusMessage: "Invalid transfer request id."})
  }

  let response: BackendPointsTransferResponse
  try {
    response = await createBackendApiClient(event).post<BackendPointsTransferResponse>(
      "points-transfer",
      {
        recipient_user_id: recipientUserId,
        points,
        request_id: requestId,
        note: note || undefined,
      },
    )
  }
  catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.response?.status || 502)
    const data = error?.data?.data || error?.data || error?.response?._data
    throw createError({
      statusCode: [400, 401, 409, 422, 500].includes(statusCode) ? statusCode : 502,
      statusMessage: asString(data?.message || data?.errors?.error_text || error?.statusMessage) || "Unable to transfer VNSEEA.",
      data,
    })
  }

  if (Number(response.api_status) !== 200 || response.success !== true) {
    throw createError({
      statusCode: Number(response.api_status) || 502,
      statusMessage: asString(response.message || response.errors?.error_text) || "Unable to transfer VNSEEA.",
      data: response,
    })
  }

  return {
    success: true,
    message: asString(response.message),
    requestId: asString(response.request_id) || requestId,
    idempotentReplay: Boolean(response.idempotent_replay),
    recipientId: asNumber(response.recipient_id),
    recipientName: asString(response.recipient_name),
    senderPoints: asNumber(response.sender_points),
    recipientPoints: asNumber(response.recipient_points),
    points: asNumber(response.points),
    senderTransactionId: asNumber(response.sender_transaction_id),
    recipientTransactionId: asNumber(response.recipient_transaction_id),
  }
})
