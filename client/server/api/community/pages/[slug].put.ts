// English description: Updates an existing community page in the PHP backend and returns the refreshed record.

import { getRouterParam, readBody } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { resolvePageRecordBySlug } from "../_shared"

type UpdatePageBody = {
  name?: string
  slug?: string
  summary?: string
  website?: string
  locationLabel?: string
  category?: string
  ownerLabel?: string
}

type BackendUpdatePageResponse = {
  api_status?: number | string
  message?: string
  errors?: {
    error_text?: string
  }
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "")
  const body = await readBody<UpdatePageBody>(event)
  const client = createBackendApiClient(event)
  const page = await resolvePageRecordBySlug(event, slug)

  assertBackendApiSuccess(
    await client.post<BackendUpdatePageResponse, Record<string, unknown>>(
      "update-page-data",
      {
        page_id: page.id,
        page_name: String(body.slug || page.slug).trim(),
        page_title: String(body.name || page.name).trim(),
        page_description: String(body.summary || page.summary).trim(),
        page_category: String(body.category || page.category).trim(),
        website: String(body.website || "").trim(),
        address: String(body.locationLabel || "").trim(),
        company: String(body.ownerLabel || "").trim(),
      },
    ),
    "Unable to update page.",
  )

  return await resolvePageRecordBySlug(event, String(body.slug || slug))
})

