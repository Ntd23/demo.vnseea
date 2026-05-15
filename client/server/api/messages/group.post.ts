// English description: Creates a backend group chat from selected recipients using the PHP group_chat create flow.

import { readBody } from "h3"
import { createMessageGroup } from "./_shared"

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const rawIds = Array.isArray(body.recipientIds) ? body.recipientIds : []

  return await createMessageGroup(event, {
    name: String(body.name || ""),
    recipientIds: rawIds.map(Number),
  })
})
