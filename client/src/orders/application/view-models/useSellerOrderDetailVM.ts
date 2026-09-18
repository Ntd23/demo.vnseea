import type { MaybeRefOrGetter } from "vue"
import { createApiOrderRepository } from "../../infrastructure/repositories/ApiOrderRepository"

export function useSellerOrderDetailVM(
  orderId: MaybeRefOrGetter<string>,
  repository = createApiOrderRepository(),
) {
  const resolvedOrderId = computed(() => toValue(orderId))

  const { data: order, status, error, refresh } = useAsyncData(
    () => `orders:seller:${resolvedOrderId.value}`,
    () => repository.getSellerOrderById(resolvedOrderId.value),
    {
      watch: [resolvedOrderId],
      default: () => null,
    },
  )

  const isConfirming = ref(false)

  const confirmOrder = async () => {
    if (!order.value || order.value.status !== "pending" || isConfirming.value) {
      return
    }

    isConfirming.value = true

    try {
      // The Nuxt bridge translates this seller action to PHP's accepted status.
      await repository.updateSellerOrderStatus(resolvedOrderId.value, "pending")
      await refresh()
    }
    finally {
      isConfirming.value = false
    }
  }

  return {
    order,
    status,
    error,
    refresh,
    isConfirming,
    confirmOrder,
  }
}
