// English description: Sends a message into a normalized user, group, or page thread and returns the created message payload.

import { createError, readBody } from "h3"
import { sendMessageToThread } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const type = typeof body.type === "string" ? body.type : ""
  const text = typeof body.text === "string" ? body.text.trim() : ""

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message text is required.",
    })
  }

  return await sendMessageToThread(event, {
    type: type as "user" | "group" | "page",
    userId: Number(body.userId ?? 0),
    groupId: Number(body.groupId ?? 0),
    pageId: Number(body.pageId ?? 0),
    recipientId: Number(body.recipientId ?? 0),
    text,
  })
})
