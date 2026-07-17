// English description: Returns paginated forum replies created by the authenticated user.

import { getQuery } from "h3"
import { fetchMyForumMessages } from "./_shared"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await fetchMyForumMessages(event, {
    offset: typeof query.offset === "string" ? Number(query.offset) || null : null,
    limit: typeof query.limit === "string" ? Number(query.limit) || 10 : 10,
  })
})
