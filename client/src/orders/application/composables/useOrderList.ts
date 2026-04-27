import { createOrdersSnapshot } from "../use-cases/create-orders-snapshot"
import type {
  BuyerOrder,
  BuyerOrderFilter,
  OrdersFilterOption,
  OrdersOverviewCard,
} from "../../domain/types/orders.types"

// Labels are often kept in types or i18n, but for simplicity of the ViewModel we can define them here or import them.
const buyerOrderFilterLabels: Record<BuyerOrderFilter, string> = {
  all: "orders.filter.all",
  pending: "orders.status.pending.label",
  shipping: "orders.status.shipping.label",
  delivered: "orders.status.delivered.label",
  cancelled: "orders.status.cancelled.label",
}

export const useOrderList = () => {
  const { t } = useI18n()
  
  // State
  const orders = ref<BuyerOrder[]>(createOrdersSnapshot())
  const search = ref("")
  const activeFilter = ref<BuyerOrderFilter>("all")

  // Computed
  const filters = computed<OrdersFilterOption[]>(() => [
    { key: "all", label: buyerOrderFilterLabels.all, count: orders.value.length },
    { key: "pending", label: buyerOrderFilterLabels.pending, count: orders.value.filter(o => o.status === "pending").length },
    { key: "shipping", label: buyerOrderFilterLabels.shipping, count: orders.value.filter(o => o.status === "shipping").length },
    { key: "delivered", label: buyerOrderFilterLabels.delivered, count: orders.value.filter(o => o.status === "delivered").length },
    { key: "cancelled", label: buyerOrderFilterLabels.cancelled, count: orders.value.filter(o => o.status === "cancelled").length },
  ])

  const activeFilterLabel = computed(() => t(buyerOrderFilterLabels[activeFilter.value]))

  const visibleOrders = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return orders.value.filter((order) => {
      const matchesFilter = activeFilter.value === "all" || order.status === activeFilter.value
      if (!matchesFilter) return false
      if (!keyword) return true

      return [
        order.orderNumber,
        order.seller,
        order.shippingAddress,
        ...order.items.map(item => t(item.name)),
      ].some(field => field.toLowerCase().includes(keyword))
    })
  })

  const overviewCards = computed<OrdersOverviewCard[]>(() => [
    {
      label: "orders.status.pending.label",
      value: String(orders.value.filter(o => o.status === "pending").length),
      description: "orders.status.pending.description",
      icon: "i-ph-hourglass-medium-fill",
      tone: "amber",
    },
    {
      label: "orders.status.shipping.label",
      value: String(orders.value.filter(o => o.status === "shipping").length),
      description: "orders.status.shipping.description",
      icon: "i-ph-truck-fill",
      tone: "blue",
    },
    {
      label: "orders.status.delivered.label",
      value: String(orders.value.filter(o => o.status === "delivered").length),
      description: "orders.status.delivered.description",
      icon: "i-ph-check-circle-fill",
      tone: "green",
    },
    {
      label: "orders.status.cancelled.label",
      value: String(orders.value.filter(o => o.status === "cancelled").length),
      description: "orders.status.cancelled.description",
      icon: "i-ph-x-circle-fill",
      tone: "rose",
    },
  ])

  const nextDeliveryOrder = computed(() =>
    orders.value.find(o => o.status === "shipping")
    ?? orders.value.find(o => o.status === "pending")
    ?? null,
  )

  return {
    orders,
    search,
    activeFilter,
    filters,
    activeFilterLabel,
    visibleOrders,
    overviewCards,
    nextDeliveryOrder,
  }
}
