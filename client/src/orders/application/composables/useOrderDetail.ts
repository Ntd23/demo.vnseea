import { createOrdersSnapshot } from "../use-cases/create-orders-snapshot"
import type { BuyerOrder } from "../../domain/types/orders.types"

export const useOrderDetail = (orderId: string | Ref<string>) => {
  const orders = ref<BuyerOrder[]>(createOrdersSnapshot())
  
  const idValue = isRef(orderId) ? orderId.value : orderId
  
  const order = computed(() => 
    orders.value.find(o => o.id === idValue) || null
  )

  const isPending = computed(() => order.value?.status === "pending")
  const isShipping = computed(() => order.value?.status === "shipping")
  const isDelivered = computed(() => order.value?.status === "delivered")
  const isCancelled = computed(() => order.value?.status === "cancelled")

  return {
    order,
    isPending,
    isShipping,
    isDelivered,
    isCancelled,
  }
}
