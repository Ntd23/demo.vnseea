// English description: Deletes a marketplace product through its authenticated feed post.

import { createError, getRouterParam } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendOk } from "./_shared"

type BackendDeleteProductResponse = {
  api_status?: number | string
  action?: string
  message?: string
  errors?: { error_text?: string }
}

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, "id") ?? "")

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid product id.",
    })
  }

  const client = createBackendApiClient(event)
  const response = await client.post<BackendDeleteProductResponse>("post-actions", {
    post_id: id,
    action: "delete",
  })
  assertBackendOk(response)

  if (response.action !== "deleted") {
    throw createError({
      statusCode: 400,
      statusMessage: response.errors?.error_text || response.message || "Unable to delete product.",
      data: response,
    })
  }

  return {
    success: true,
  }
})
