// English description: Creates a marketplace product by forwarding multipart form data to the PHP create-product API.

import { createError, readMultipartFormData } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendOk } from "./_shared"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const parts = await readMultipartFormData(event)

  if (!parts?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Product form data is required.",
    })
  }

  const form = new FormData()

  for (const part of parts) {
    if (!part.name) continue

    if (part.filename) {
      form.append(part.name, new Blob([part.data], { type: part.type || "application/octet-stream" }), part.filename)
    }
    else {
      form.append(part.name, Buffer.from(part.data).toString("utf8"))
    }
  }

  const response = await client.post<{ api_status?: number | string; product_id?: number | string; product_post_id?: number | string; message?: string; errors?: { error_text?: string } }>("create-product", form)
  assertBackendOk(response)

  return {
    id: String(response.product_id || ""),
    postId: String(response.product_post_id || ""),
  }
})
