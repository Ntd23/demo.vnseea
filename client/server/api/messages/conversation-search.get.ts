// English description: Searches messages inside an authorized one-to-one conversation.

import { getQuery } from "h3"
import { searchUserConversation } from "./_shared"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await searchUserConversation(
    event,
    Number(query.userId || 0),
    String(query.query || ""),
  )
})
