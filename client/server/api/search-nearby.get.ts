// English description: Bridges nearby map search requests to the PHP session-backed nearby source.

import { getQuery } from "h3"
import { fetchNearbySearchFromBackend } from "../utils/nearby-search-bridge"
import type { NearbySearchResponse } from "../../src/search-nearby/domain/types/search-nearby.types"

export default defineEventHandler(async (event): Promise<NearbySearchResponse> => {
  const query = getQuery(event)

  return await fetchNearbySearchFromBackend(event, {
    query: query.q || query.query,
    type: query.type,
    distance: query.distance,
    limit: query.limit,
    originLat: query.originLat || query.origin_lat,
    originLng: query.originLng || query.origin_lng,
    defaultLimit: 40,
    maxLimit: 80,
  })
})
