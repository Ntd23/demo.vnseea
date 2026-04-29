import type { OrderRepository, GetBuyerOrdersQuery } from "../../domain/repositories/OrderRepository"
import type { BuyerOrder, BuyerOrderStatus, SellerOrder } from "../../domain/types/orders.types"
import { apiRoutes } from "../../../shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "../../../shared-kernel/infrastructure/http/nuxt-api-client"
import { createMockOrderRepository } from "./MockOrderRepository"

export function createApiOrderRepository(
  fallback: OrderRepository = createMockOrderRepository(),
): OrderRepository {
  const client = useNuxtApiClient()

  return {
    async getBuyerOrders(query?: GetBuyerOrdersQuery) {
      try {
        return await client.get<BuyerOrder[]>(apiRoutes.orders.list, query)
      }
      catch {
        return fallback.getBuyerOrders(query)
      }
    },
    async getBuyerOrderById(id: string) {
      try {
        return await client.get<BuyerOrder | null>(apiRoutes.orders.detail(id))
      }
      catch {
        return fallback.getBuyerOrderById(id)
      }
    },
    async getSellerOrderById(id: string) {
      try {
        return await client.get<SellerOrder | null>(apiRoutes.customerOrders.detail(id))
      }
      catch {
        return fallback.getSellerOrderById(id)
      }
    },
    async markBuyerOrderReceived(id: string) {
      try {
        return await client.post<{ success: boolean }>(apiRoutes.orders.received(id))
      }
      catch {
        return fallback.markBuyerOrderReceived(id)
      }
    },
    async updateSellerOrderStatus(id: string, status: BuyerOrderStatus) {
      try {
        return await client.post<{ success: boolean }, { status: BuyerOrderStatus }>(
          apiRoutes.customerOrders.status(id),
          { status },
        )
      }
      catch {
        return fallback.updateSellerOrderStatus(id, status)
      }
    },
  }
}
