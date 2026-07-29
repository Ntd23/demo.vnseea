// English description: Pins or unpins a message through the shared mobile/web backend API.

import { readBody } from "h3"
import { updateMessagePin } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  return await updateMessagePin(event, {
    type: String(body.type || "") as "user" | "group" | "page",
    userId: Number(body.userId || 0),
    chatId: Number(body.chatId || 0),
    groupId: Number(body.groupId || 0),
    pageId: Number(body.pageId || 0),
    recipientId: Number(body.recipientId || 0),
    messageId: Number(body.messageId || 0),
    pinned: body.pinned === true || body.pinned === 1 || body.pinned === "1",
  })
})
