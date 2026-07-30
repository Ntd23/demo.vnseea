// English description: Returns media, files, and links shared in a one-to-one conversation.

import { getQuery } from "h3"
import { fetchUserConversationSharedContent } from "./_shared"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await fetchUserConversationSharedContent(event, Number(query.userId || 0))
})
