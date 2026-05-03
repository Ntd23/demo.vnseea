// English description: Updates an existing community group in the PHP backend and returns the refreshed record.

import { getRouterParam, readBody } from "h3"
import { assertBackendApiSuccess } from "../../../utils/backend-api-response"
import { createBackendApiClient } from "../../../utils/backend-api-client"
import { resolveGroupRecordBySlug } from "../_shared"

type UpdateGroupBody = {
  name?: string
  slug?: string
  summary?: string
  website?: string
  locationLabel?: string
  privacy?: "public" | "private" | "secret"
  category?: string
  joinApproval?: boolean
}

type BackendUpdateGroupResponse = {
  api_status?: number | string
  message?: string
  errors?: {
    error_text?: string
  }
}

const toBackendPrivacy = (value: UpdateGroupBody["privacy"]) =>
  value === "private" || value === "secret" ? 2 : 1

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, "slug") || "")
  const body = await readBody<UpdateGroupBody>(event)
  const client = createBackendApiClient(event)
  const group = await resolveGroupRecordBySlug(event, slug)

  assertBackendApiSuccess(
    await client.post<BackendUpdateGroupResponse, Record<string, unknown>>(
      "update-group-data",
      {
        group_id: group.id,
        group_name: String(body.slug || group.slug).trim(),
        group_title: String(body.name || group.name).trim(),
        about: String(body.summary || group.summary).trim(),
        category: String(body.category || group.category).trim(),
        privacy: toBackendPrivacy(body.privacy || group.privacy),
        join_privacy: body.joinApproval ? 2 : 1,
        website: String(body.website || "").trim(),
        address: String(body.locationLabel || "").trim(),
      },
    ),
    "Unable to update group.",
  )

  return await resolveGroupRecordBySlug(event, String(body.slug || slug))
})

