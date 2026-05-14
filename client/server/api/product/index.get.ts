// English description: Returns real marketplace products from the PHP get-products API.

import { getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUserId, normalizeProductsResponse } from "./_shared"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const query = getQuery(event)
  const limit = Math.min(50, Math.max(1, Number(query.limit || 35)))
  const category = String(query.category || "")
  const distance = String(query.distance || "")
  const userId = query.mine ? await getBackendCurrentUserId(event) : ""

  const response = await client.post<Parameters<typeof normalizeProductsResponse>[1]>("get-products", {
    limit,
    user_id: userId || undefined,
    offset: query.offset,
    keyword: query.keyword || query.q,
    category_id: /^\d+$/.test(category) ? category : undefined,
    distance: distance && distance !== "all" ? distance : undefined,
  })

  return normalizeProductsResponse(event, response, limit)
})
