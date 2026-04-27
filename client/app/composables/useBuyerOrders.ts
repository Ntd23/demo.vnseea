import { useOrderList } from "../../src/orders/application/composables/useOrderList"

/**
 * Legacy delegate for useBuyerOrders.
 * Logic has been moved to src/orders/application/composables/useOrderList.ts
 */
export const useBuyerOrders = () => {
  const { orders } = useOrderList()

  const findOrderById = (orderId: string) =>
    orders.value.find(order => order.id === orderId) ?? null

  return {
    orders,
    findOrderById,
  }
}
