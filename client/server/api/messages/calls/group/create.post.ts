// English description: Starts or reuses a backend group LiveKit call and returns its join URL.

import { callBackend } from "../_shared"
import { buildGroupCallRoute } from "./_shared"

const asNumber = (value: unknown) => {
  const numberValue = Number(value ?? 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const response = await callBackend(event, "create_new_group_call", {
    group_id: asNumber(body.groupId),
    call_type: "video",
  })

  return {
    status: asNumber(response.status),
    id: asNumber(response.id) || asNumber(response.call_id),
    groupId: asNumber(response.group_id),
    type: "video" as const,
    url: buildGroupCallRoute(asNumber(response.id) || asNumber(response.call_id), response.call_type || "video"),
    groupName: asString(response.group_name),
    participantCount: asNumber(response.participant_count),
    isExisting: response.is_existing === 1 || response.is_existing === "1" || response.is_existing === true,
  }
})
