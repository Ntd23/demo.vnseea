// English description: Saves a checkout shipping address through the PHP address API.

import { readBody } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { ShippingAddress } from "../../../src/checkout/domain/types/checkout.types"
import { assertBackendOk, normalizeAddress } from "./_shared"

export default defineEventHandler(async (event) => {
  const client = createBackendApiClient(event)
  const body = await readBody<ShippingAddress>(event)

  const response = await client.post<{ api_status?: number | string; message?: string; errors?: { error_text?: string } }>("address", {
    type: "add",
    name: body.fullName,
    phone: body.phone,
    country: body.country,
    city: body.city,
    zip: body.postalCode,
    address: body.streetAddress,
  })
  assertBackendOk(response)

  const addresses = await client.post<{ data?: Parameters<typeof normalizeAddress>[0][] }>("address", { type: "get", limit: 1 })
  const saved = normalizeAddress(Array.isArray(addresses.data) ? addresses.data[0] : null)

  if (!saved) {
    return body
  }

  return saved
})
