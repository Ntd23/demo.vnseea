// English description: Creates a new community page in the PHP backend and returns the normalized record.

import { readBody } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { mapCommunityPageRecord } from "./_shared"

type CreatePageBody = {
  name?: string
  slug?: string
  description?: string
  category?: string
}

type BackendCreatePageResponse = {
  api_status?: number | string
  page_data?: Record<string, unknown>
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreatePageBody>(event)
  const client = createBackendApiClient(event)
  const currentUser = await getBackendCurrentUser(event)

  const response = assertBackendApiSuccess(
    await client.post<BackendCreatePageResponse, Record<string, unknown>>(
      "create-page",
      {
        page_name: String(body.slug || "").trim(),
        page_title: String(body.name || "").trim(),
        page_category: String(body.category || "").trim(),
        page_description: String(body.description || "").trim(),
      },
    ),
    "Unable to create page.",
  )

  return mapCommunityPageRecord(response.page_data ?? {}, {
    currentUserId: Number(currentUser.user_id ?? 0),
  })
})

