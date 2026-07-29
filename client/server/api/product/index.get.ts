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
  const pageIdValue = Array.isArray(query.pageId) ? query.pageId[0] : query.pageId
  const pageId = String(pageIdValue || "")
  const sort = String(query.sort || "")
  const distanceValue = Array.isArray(query.distance) ? query.distance[0] : query.distance
  const parsedDistance = Number(distanceValue)
  const requestedDistance = Number.isFinite(parsedDistance) && parsedDistance > 0
    ? Math.min(300, parsedDistance)
    : undefined
  const parsedLatitude = Number(Array.isArray(query.latitude) ? query.latitude[0] : query.latitude)
  const parsedLongitude = Number(Array.isArray(query.longitude) ? query.longitude[0] : query.longitude)
  const hasCurrentCoordinates = Number.isFinite(parsedLatitude)
    && parsedLatitude >= -90
    && parsedLatitude <= 90
    && Number.isFinite(parsedLongitude)
    && parsedLongitude >= -180
    && parsedLongitude <= 180
  const mineValue = Array.isArray(query.mine) ? query.mine[0] : query.mine
  const mineOnly = ["1", "true"].includes(String(mineValue ?? "0").toLowerCase())
  const normalizedSellerUserId = /^\d+$/.test(sellerUserId) ? sellerUserId : ""
  const normalizedPageId = /^\d+$/.test(pageId) ? pageId : ""

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
    page_id: normalizedPageId || undefined,
    offset: query.offset,
    keyword: query.keyword || query.q,
    category_id: /^\d+$/.test(category) ? category : undefined,
    sub_id: /^\d+$/.test(subCategory) ? subCategory : undefined,
    // Distance filtering uses the browser's current coordinates when supplied.
    distance: requestedDistance && hasCurrentCoordinates ? requestedDistance : undefined,
    latitude: requestedDistance && hasCurrentCoordinates ? parsedLatitude : undefined,
    longitude: requestedDistance && hasCurrentCoordinates ? parsedLongitude : undefined,
    order_by: ["price_low", "price_high"].includes(sort) ? sort : undefined,
  })

  return normalizeProductsResponse(event, response, limit)
})
