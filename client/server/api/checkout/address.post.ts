// English description: Adds a checkout address and returns the exact new backend record.

import { readBody } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { ShippingAddress } from "../../../src/checkout/domain/types/checkout.types"
import { assertBackendOk, normalizeAddress } from "./_shared"

type BackendAddressRow = {
  id?: number | string
  name?: string
  phone?: string
  country?: string
  city?: string
  address?: string
}

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const body = await readBody<ShippingAddress>(event)

  const payload: Record<string, string | null> = {
    type: "add",
    name: body.fullName,
    phone: body.phone,
    country: body.country,
    city: body.city,
    zip: null,
    address: body.streetAddress,
  }

  const response = await client.post<{ api_status?: number | string; message?: string; errors?: { error_text?: string } }>("address", payload)
  assertBackendOk(response)

  const addresses = await client.post<{ data?: BackendAddressRow[] }>("address", { type: "get", limit: 20 })
  const rows = Array.isArray(addresses.data) ? addresses.data.filter(Boolean) : []

  const matched = rows
    .filter(address => (
      address.name === body.fullName
      && address.phone === body.phone
      && address.country === body.country
      && address.city === body.city
      && address.address === body.streetAddress
    ))
    .sort((left, right) => Number(right.id ?? 0) - Number(left.id ?? 0))[0]

  const saved = normalizeAddress(matched || rows[0] || null)

  if (!saved) {
    return body
  }

  return saved
})
