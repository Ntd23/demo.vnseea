// English description: Toggles backend notification sound preference through the legacy PHP request handler.

import { createError } from "h3"
import { createBackendWebClient } from "../../utils/backend-web-client"

type BackendSoundToggleResponse = {
  status?: number | string
  message?: string
}

export default defineEventHandler(async (event) => {
  const client = createBackendWebClient(event)
  const response = await client.postForm<BackendSoundToggleResponse>("turn-off-sound")
  const status = Number(response.status ?? 0)

  if (status < 200 || status >= 300) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to update notification sound.",
      data: response,
    })
  }

  const message = String(response.message || "")

  return {
    soundEnabled: !message.includes("volume-x"),
  }
})
