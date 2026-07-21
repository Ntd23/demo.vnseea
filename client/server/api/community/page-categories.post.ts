// English description: Persists a user-created page category through the authenticated PHP API.

import { createError, readBody } from "h3"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"

type CreatePageCategoryBody = {
  name?: string
}

type BackendPageCategoryResponse = {
  api_status?: number | string
  category?: {
    value?: string | number
    label?: string
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreatePageCategoryBody>(event)
  const name = String(body.name || "").trim()

  if (name.length < 2 || name.length > 80) {
    throw createError({
      statusCode: 422,
      statusMessage: "Page category must contain between 2 and 80 characters.",
    })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendPageCategoryResponse, Record<string, unknown>>(
      backendRoutes.api.pageCategories,
      { type: "create", name },
    ),
    "Unable to create page category.",
  )

  const value = String(response.category?.value || "").trim()
  const label = String(response.category?.label || name).trim()

  if (!value) {
    throw createError({
      statusCode: 502,
      statusMessage: "The backend did not return the created page category.",
    })
  }

  return { value, label }
})
