// English description: Builds internal nearby-map links for a selected post location.

import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { LocationSelection } from "../../domain/types/location.types"

type LocationMapLinkInput = Pick<LocationSelection, "address">
  & Partial<Pick<LocationSelection, "lat" | "lng" | "placeId">>

const isValidCoordinate = (value: number | null | undefined, min: number, max: number) =>
  typeof value === "number"
  && Number.isFinite(value)
  && value >= min
  && value <= max

export function buildPostLocationMapUrl(input: LocationMapLinkInput) {
  const address = input.address.trim()
  const searchParams = new URLSearchParams({
    source: "post",
    address,
    title: address,
  })

  if (
    isValidCoordinate(input.lat, -90, 90)
    && isValidCoordinate(input.lng, -180, 180)
  ) {
    searchParams.set("lat", String(input.lat))
    searchParams.set("lng", String(input.lng))
  }

  const placeId = input.placeId?.trim()
  if (placeId) {
    searchParams.set("placeId", placeId)
  }

  return `${appRoutes.searchNearby}?${searchParams.toString()}`
}
