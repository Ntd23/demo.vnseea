// English description: Returns real marketplace products from the PHP get-products API.

import { createError, getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUserId, normalizeProductsResponse } from "./_shared"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const query = getQuery(event)
  const limit = Math.min(50, Math.max(1, Number(query.limit || 35)))
  const category = String(query.category || "")
  const subCategory = String(query.subCategory || "")
  const currentUserId = await getBackendCurrentUserId(event)
  const sellerUserIdValue = Array.isArray(query.sellerUserId) ? query.sellerUserId[0] : query.sellerUserId
  const sellerUserId = String(sellerUserIdValue || "")
  const sort = String(query.sort || "")
  const mineOnly = String(Array.isArray(query.mine) ? query.mine[0] : query.mine || "0") === "1"
  const normalizedSellerUserId = /^\d+$/.test(sellerUserId) ? sellerUserId : ""

  if (mineOnly && !currentUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const endpoint = currentUserId ? "get-products" : backendRoutes.api.publicContent
  const response = await client.post<Parameters<typeof normalizeProductsResponse>[1]>(endpoint, {
    action: currentUserId ? undefined : "products",
    limit,
    user_id: mineOnly ? currentUserId : normalizedSellerUserId || undefined,
    offset: query.offset,
    keyword: query.keyword || query.q,
    category_id: /^\d+$/.test(category) ? category : undefined,
    sub_id: /^\d+$/.test(subCategory) ? subCategory : undefined,
    // The PHP distance query requires a logged-in user with valid lat/lng.
    // The endpoint returns whether distance is available, while the client applies
    // local filtering only for products that include a computed distance.
    distance: undefined,
    order_by: ["price_low", "price_high"].includes(sort) ? sort : undefined,
  })

  return normalizeProductsResponse(event, response, limit)
})
