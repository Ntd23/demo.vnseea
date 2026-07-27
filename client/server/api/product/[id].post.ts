// English description: Updates marketplace product fields and images through the PHP edit-product API.

import { createError, getHeader, getRouterParam, readBody, readMultipartFormData } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { ProductEditorDraft } from "../../../src/product/domain/types/product-editor.types"
import { assertBackendOk } from "./_shared"

type MultipartPart = {
  name?: string
  filename?: string
  type?: string
  data: Buffer
}

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const id = String(getRouterParam(event, "id") ?? "")
  const contentType = getHeader(event, "content-type") || ""
  let backendBody: FormData | Record<string, unknown>

  if (contentType.includes("multipart/form-data")) {
    const parts = await readMultipartFormData(event) as MultipartPart[] | undefined

    if (!parts?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: "Product form data is required.",
      })
    }

    const form = new FormData()
    form.append("product_id", id)

    for (const part of parts) {
      if (!part.name || part.name === "product_id") {
        continue
      }

      if (part.filename) {
        form.append(
          part.name,
          new Blob([part.data], { type: part.type || "application/octet-stream" }),
          part.filename,
        )
      }
      else {
        form.append(part.name, Buffer.from(part.data).toString("utf8"))
      }
    }

    backendBody = form
  }
  else {
    const body = await readBody<ProductEditorDraft>(event)
    const fields = body.fields

    backendBody = {
      product_id: id,
      product_title: fields.title,
      product_category: fields.category,
      product_description: fields.description,
      product_price: fields.price,
      product_location: fields.location,
      product_type: fields.condition === "used" ? "1" : "0",
      currency: fields.currency,
      units: fields.stock,
      deleted_images_ids: body.removedImageIds.join(","),
    }
  }

  const response = await client.post<{ api_status?: number | string; message?: string; errors?: { error_text?: string } }>(
    "edit-product",
    backendBody,
  )
  assertBackendOk(response)

  return {
    id,
  }
})
