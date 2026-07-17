// English description: Searches backend forums, threads, or reply messages using the legacy forum rules.

import { getQuery } from "h3"
import { searchForum } from "./_shared"
import type { ForumSearchScope } from "../../../src/forum/domain/types/forum.types"

const searchScopes = new Set<ForumSearchScope>(["forums", "threads", "messages"])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedScope = typeof query.scope === "string" ? query.scope as ForumSearchScope : "threads"

  return await searchForum(event, {
    q: typeof query.q === "string" ? query.q : "",
    scope: searchScopes.has(requestedScope) ? requestedScope : "threads",
    includeContent: query.includeContent === "1" || query.includeContent === "true",
    sectionId: typeof query.sectionId === "string" ? Number(query.sectionId) || 0 : 0,
    offset: typeof query.offset === "string" ? Number(query.offset) || null : null,
  })
})
