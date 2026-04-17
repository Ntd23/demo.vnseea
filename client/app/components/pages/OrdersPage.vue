<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      eyebrow="P-15 · Đơn hàng"
      title="Đơn hàng của tôi"
      description="Theo dõi các đơn mua trong marketplace, kiểm tra trạng thái giao hàng và mở lại chi tiết đơn khi cần."
    >
      <template #left>
        <div class="space-y-5">
          <OrdersFilterBar
            v-model:search="search"
            v-model:active-filter="activeFilter"
            :filters="filters"
            :visible-count="visibleOrders.length"
            :active-filter-label="activeFilterLabel"
          />

          <div
            v-if="visibleOrders.length > 0"
            class="space-y-4"
          >
            <OrdersBuyerOrderCard
              v-for="order in visibleOrders"
              :key="order.id"
              :order="order"
            />
          </div>

          <FoundationEmptyState
            v-else
            icon="i-ph-package-fill"
            title="Không tìm thấy đơn phù hợp"
            description="Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm. Khi bạn mua sản phẩm mới, đơn hàng sẽ xuất hiện tại đây."
          />
        </div>
      </template>

      <template #right>
        <OrdersOverviewSidebar
          :cards="overviewCards"
          :next-order="nextDeliveryOrder"
          :active-filter-label="activeFilterLabel"
          :visible-count="visibleOrders.length"
        />
      </template>
    </CheckoutLayout>
  </div>
</template>

<script setup lang="ts">
import CheckoutLayout from "../checkout/CheckoutLayout.vue"
import { buyerOrderFilterLabels } from "../../../types/orders"
import type {
  BuyerOrderFilter,
  OrdersFilterOption,
  OrdersOverviewCard,
} from "../../../types/orders"

useSeoMeta({
  title: "Đơn hàng của tôi | VNSEEA",
  description: "Theo dõi đơn mua, trạng thái giao hàng và tổng quan các đơn marketplace của bạn trên VNSEEA.",
})

const { orders } = useBuyerOrders()

const search = ref("")
const activeFilter = ref<BuyerOrderFilter>("all")

const filters = computed<OrdersFilterOption[]>(() => [
  { key: "all", label: buyerOrderFilterLabels.all, count: orders.value.length },
  { key: "pending", label: buyerOrderFilterLabels.pending, count: orders.value.filter(order => order.status === "pending").length },
  { key: "shipping", label: buyerOrderFilterLabels.shipping, count: orders.value.filter(order => order.status === "shipping").length },
  { key: "delivered", label: buyerOrderFilterLabels.delivered, count: orders.value.filter(order => order.status === "delivered").length },
  { key: "cancelled", label: buyerOrderFilterLabels.cancelled, count: orders.value.filter(order => order.status === "cancelled").length },
])

const activeFilterLabel = computed(() => buyerOrderFilterLabels[activeFilter.value])

const visibleOrders = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return orders.value.filter((order) => {
    const matchesFilter = activeFilter.value === "all" || order.status === activeFilter.value

    if (!matchesFilter) {
      return false
    }

    if (!keyword) {
      return true
    }

    return [
      order.orderNumber,
      order.seller,
      order.shippingAddress,
      ...order.items.map(item => item.name),
    ].some(field => field.toLowerCase().includes(keyword))
  })
})

const overviewCards = computed<OrdersOverviewCard[]>(() => [
  {
    label: "Chờ xác nhận",
    value: String(orders.value.filter(order => order.status === "pending").length),
    description: "Các đơn vừa đặt, đang chờ shop xác nhận và chuẩn bị.",
    icon: "i-ph-hourglass-medium-fill",
    tone: "amber",
  },
  {
    label: "Đang giao",
    value: String(orders.value.filter(order => order.status === "shipping").length),
    description: "Đơn đã rời kho và đang trên hành trình đến tay bạn.",
    icon: "i-ph-truck-fill",
    tone: "blue",
  },
  {
    label: "Hoàn tất",
    value: String(orders.value.filter(order => order.status === "delivered").length),
    description: "Đơn đã giao thành công và có thể xem lại để mua tiếp.",
    icon: "i-ph-check-circle-fill",
    tone: "green",
  },
  {
    label: "Đã hủy",
    value: String(orders.value.filter(order => order.status === "cancelled").length),
    description: "Các đơn bị hủy hoặc đã hoàn tiền về ví nội bộ.",
    icon: "i-ph-x-circle-fill",
    tone: "rose",
  },
])

const nextDeliveryOrder = computed(() =>
  orders.value.find(order => order.status === "shipping")
  ?? orders.value.find(order => order.status === "pending")
  ?? null,
)
</script>
