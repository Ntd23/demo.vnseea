import type { CheckoutRepository } from "../../domain/repositories/CheckoutRepository"
import type { CheckoutSnapshot, ShippingAddress } from "../../domain/types/checkout.types"
import { apiRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"
import { createMockCheckoutRepository } from "./MockCheckoutRepository"

export function createApiCheckoutRepository(
  fallback: CheckoutRepository = createMockCheckoutRepository(),
): CheckoutRepository {
  const client = useNuxtApiClient()

  return {
    async getSnapshot() {
      try {
        return await client.get<CheckoutSnapshot>(apiRoutes.checkout.snapshot)
      }
      catch {
        return fallback.getSnapshot()
      }
    },
    async saveShippingAddress(address: ShippingAddress) {
      try {
        return await client.post<ShippingAddress, ShippingAddress>(apiRoutes.checkout.address, address)
      }
      catch {
        return fallback.saveShippingAddress(address)
      }
    },
    async submitOrder(snapshot: CheckoutSnapshot) {
      try {
        return await client.post<{ success: boolean; orderId: string }, CheckoutSnapshot>(
          apiRoutes.checkout.submit,
          snapshot,
        )
      }
      catch {
        return fallback.submitOrder(snapshot)
      }
    },
  }
}
