// English description: Returns the backend-backed games catalog for the games route.

import { getQuery } from "h3"
import { fetchGamesCatalog } from "./_shared"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tab = query.tab === "latest" || query.tab === "popular" ? query.tab : "my"

  return await fetchGamesCatalog(event, {
    tab,
    q: typeof query.q === "string" ? query.q : "",
    offset: typeof query.offset === "string" ? Number(query.offset) || null : null,
    limit: typeof query.limit === "string" ? Number(query.limit) || 20 : 20,
  })
})
