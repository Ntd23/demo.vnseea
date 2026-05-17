// English description: Checkout repository implementation that calls Nuxt API bridges without mock fallback.

import type { CheckoutRepository } from "../../domain/repositories/CheckoutRepository"
import type { CheckoutSnapshot, ShippingAddress } from "../../domain/types/checkout.types"
import { apiRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"

export function createApiCheckoutRepository(): CheckoutRepository {
  const client = useNuxtApiClient()

  return {
    async getSnapshot() {
      return await client.get<CheckoutSnapshot>(apiRoutes.checkout.snapshot)
    },
    async getAddresses() {
      return await client.get<ShippingAddress[]>(apiRoutes.checkout.addresses)
    },
    async saveShippingAddress(address: ShippingAddress) {
      return await client.post<ShippingAddress, ShippingAddress>(apiRoutes.checkout.address, address)
    },
    async submitOrder(snapshot: CheckoutSnapshot) {
      return await client.post<{ success: boolean; orderId: string }, CheckoutSnapshot>(
        apiRoutes.checkout.submit,
        snapshot,
      )
    },
  }
}
