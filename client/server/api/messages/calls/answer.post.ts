// English description: Accepts an incoming one-to-one call and returns the LiveKit join payload.

import { assertBackendStatus, callBackend, mapLiveKitSession, readCallBody } from "./_shared"

export default defineEventHandler(async (event) => {
  const input = await readCallBody(event)

  if (!input.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "A call id is required.",
    })
  }

  const answerResponse = await callBackend(event, "answer_call", {
    id: input.id,
    type: input.type,
  })
  if (Number(answerResponse.status ?? 0) !== 200) {
    assertBackendStatus(answerResponse, "Unable to answer call.")
  }
  try {
    const payload = await callBackend(event, "livekit_call_payload", {
      id: input.id,
      type: input.type,
    })

    return mapLiveKitSession(payload, "incoming")
  }
  catch (error) {
    await callBackend(event, "close_call", {
      id: input.id,
      call_type: input.type,
      status: "cancelled",
      duration: 0,
      provider: "livekit",
    }).catch(() => null)
    throw error
  }
})
