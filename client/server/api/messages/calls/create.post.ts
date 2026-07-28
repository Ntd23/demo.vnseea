// English description: Starts a one-to-one audio or video call through the PHP call flow.

import {
  assertBackendStatus,
  callBackend,
  mapCreateResult,
  readCallBody,
} from "./_shared"

export default defineEventHandler(async (event) => {
  const input = await readCallBody(event)

  if (!input.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A recipient userId is required.",
    })
  }

  const response = await callBackend(event, "create_livekit_call", {
    recipient_id: input.userId,
    call_type: input.type,
  })

  assertBackendStatus(response, "Unable to start call.")
  return mapCreateResult(response, input.type)
})
