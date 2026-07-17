// English description: Returns paginated backend forum members with optional name and alphabet filters.

import { getQuery } from "h3"
import { fetchForumMembers } from "./_shared"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await fetchForumMembers(event, {
    q: typeof query.q === "string" ? query.q : "",
    letter: typeof query.letter === "string" ? query.letter : "",
    offset: typeof query.offset === "string" ? Number(query.offset) || null : null,
  })
})
