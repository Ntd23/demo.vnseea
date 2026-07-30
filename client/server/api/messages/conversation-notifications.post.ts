// English description: Enables or disables notifications for a one-to-one conversation.

import { readBody } from "h3"
import { updateUserConversationNotifications } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  return await updateUserConversationNotifications(event, {
    chatId: Number(body.chatId || 0),
    enabled: body.enabled === true || body.enabled === 1 || body.enabled === "1",
  })
})
