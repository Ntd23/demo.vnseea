// English description: Returns the backend-backed jobs catalog with real filters, metadata, and pagination state for the jobs route.

import { getQuery } from "h3"
import { fetchJobsCatalog } from "./_shared"

const parseCoordinate = (value: unknown, min: number, max: number) => {
  if (typeof value !== "string" || value.trim() === "") return undefined
  const coordinate = Number(value)
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : undefined
}

const parseDistance = (value: unknown) => {
  if (typeof value !== "string" || value.trim() === "") return undefined
  const distance = Math.round(Number(value))
  return Number.isFinite(distance) && distance > 0
    ? Math.min(distance, 300)
    : undefined
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await fetchJobsCatalog(event, {
    q: typeof query.q === "string" ? query.q.trim() : "",
    category: typeof query.category === "string" ? query.category.trim() : "",
    type: typeof query.type === "string" ? query.type.trim() : "",
    distance: parseDistance(query.distance),
    originLat: parseCoordinate(query.originLat, -90, 90),
    originLng: parseCoordinate(query.originLng, -180, 180),
    afterId: typeof query.afterId === "string" ? Number(query.afterId) || undefined : undefined,
    limit: typeof query.limit === "string" ? Number(query.limit) || undefined : 10,
  })
})
