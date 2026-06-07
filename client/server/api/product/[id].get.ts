// English description: Returns a marketplace product record for the editor from the PHP product list API.

import { getRouterParam } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUserId, normalizeProductRecord } from "./_shared"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const id = decodeURIComponent(String(getRouterParam(event, "id") ?? ""))
  const numericPostId = id.match(/^\d+/)?.[0] ?? ""
  const publicLookupPayload = id !== numericPostId && numericPostId
    ? { action: "product", post_id: id }
    : { action: "product", product_id: id }

  const userId = await getBackendCurrentUserId(event)
  if (!userId) {
    const response = await client.post<{ api_status?: number | string; product?: Parameters<typeof normalizeProductRecord>[1] }>(
      backendRoutes.api.publicContent,
      publicLookupPayload,
    )

    return response.product ? normalizeProductRecord(event, response.product) : null
  }

  const response = await client.post<{ api_status?: number | string; products?: Parameters<typeof normalizeProductRecord>[1][] }>("get-products", {
    limit: 250,
  })
  const product = (Array.isArray(response.products) ? response.products : [])
    .find(item => [
      item.id,
      item.post_id,
      item.seo_id,
    ].some(value => String(value ?? "") === id || (!!numericPostId && String(value ?? "") === numericPostId)))

  if (product) {
    return normalizeProductRecord(event, product)
  }

  const publicResponse = await client.post<{ api_status?: number | string; product?: Parameters<typeof normalizeProductRecord>[1] }>(
    backendRoutes.api.publicContent,
    publicLookupPayload,
  )

  return publicResponse.product ? normalizeProductRecord(event, publicResponse.product) : null
})
