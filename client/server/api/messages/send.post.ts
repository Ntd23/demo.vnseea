// English description: Sends a message into a normalized user, group, or page thread and returns the created message payload.

import { createError } from "h3"
import { parseMessageSendBody, sendMessageToThread } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await parseMessageSendBody(event)
  const text = body.text.trim()

  if (!text && !body.file) {
    throw createError({
      statusCode: 400,
      statusMessage: "Message text or file is required.",
    })
  }

  return await sendMessageToThread(event, {
    type: body.type,
    userId: body.userId,
    groupId: body.groupId,
    pageId: body.pageId,
    recipientId: body.recipientId,
    text,
    file: body.file,
  })
})
