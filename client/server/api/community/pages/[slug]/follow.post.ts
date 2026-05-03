// English description: Toggles page follow state in the PHP browser-session backend and returns the refreshed page record.

import { createError, getRouterParam } from "h3"
import { createBackendWebClient } from "../../../../utils/backend-web-client"
import { getBackendCurrentUser } from "../../../../utils/backend-current-user"
import { resolvePageRecordBySlug } from "../../_shared"

type BackendLikePageResponse = {
  status?: number | string
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "")
  const currentUser = await getBackendCurrentUser(event)
  const page = await resolvePageRecordBySlug(event, slug)
  const client = createBackendWebClient(event)

  const response = await client.postForm<BackendLikePageResponse, Record<string, unknown>>(
    "like_page",
    {
      hash_id: currentUser.session_hash,
    },
    {
      page_id: page.id,
    },
  )

  if (Number(response.status ?? 0) !== 200) {
    throw createError({
      statusCode: 400,
      statusMessage: "Unable to update page follow state.",
      data: response,
    })
  }

  return await resolvePageRecordBySlug(event, slug)
})
