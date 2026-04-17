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
  BuyerOrder,
  BuyerOrderFilter,
  OrdersFilterOption,
  OrdersOverviewCard,
} from "../../../types/orders"

useSeoMeta({
  title: "Đơn hàng của tôi | VNSEEA",
  description: "Theo dõi đơn mua, trạng thái giao hàng và tổng quan các đơn marketplace của bạn trên VNSEEA.",
})

const orders = ref<BuyerOrder[]>([
  {
    id: "ord-240417-118",
    orderNumber: "ORD-240417-118",
    seller: "Studio Mộc",
    placedAt: "17/04/2026 · 09:20",
    status: "pending",
    deliveryWindow: "Shop dự kiến xác nhận trong 2 giờ",
    paymentMethod: "Ví VNSEEA",
    shippingAddress: "Tầng 8, 18 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
    shippingFee: 0,
    total: 1780000,
    items: [
      {
        id: "i-1",
        name: "Loa bluetooth mini",
        quantity: 1,
        price: 890000,
        imageStyle: [
          "radial-gradient(circle at 78% 12%, rgba(255,214,182,0.42), transparent 18%)",
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.24), transparent 22%)",
          "linear-gradient(150deg, #111827 0%, #4f46e5 42%, #c4b5fd 100%)",
        ].join(", "),
      },
      {
        id: "i-2",
        name: "Tai nghe chống ồn",
        quantity: 1,
        price: 890000,
        imageStyle: [
          "radial-gradient(circle at 75% 16%, rgba(255,255,255,0.26), transparent 20%)",
          "linear-gradient(140deg, #243b63 0%, #6c8de2 44%, #dbeafe 100%)",
        ].join(", "),
      },
    ],
  },
  {
    id: "ord-240416-083",
    orderNumber: "ORD-240416-083",
    seller: "Nông trại Bơ",
    placedAt: "16/04/2026 · 15:40",
    status: "shipping",
    deliveryWindow: "Dự kiến giao hôm nay trước 17:30",
    paymentMethod: "Ví VNSEEA",
    shippingAddress: "12 Trần Hưng Đạo, Hải Châu, Đà Nẵng",
    shippingFee: 15000,
    total: 435000,
    items: [
      {
        id: "i-3",
        name: "Hạt điều rang muối 500g",
        quantity: 1,
        price: 210000,
        imageStyle: [
          "radial-gradient(circle at 78% 12%, rgba(255,214,182,0.36), transparent 18%)",
          "linear-gradient(150deg, #7c2d12 0%, #ea580c 40%, #fdba74 100%)",
        ].join(", "),
      },
      {
        id: "i-4",
        name: "Mật ong rừng nguyên chất",
        quantity: 1,
        price: 210000,
        imageStyle: [
          "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.28), transparent 18%)",
          "linear-gradient(140deg, #713f12 0%, #f59e0b 48%, #fde68a 100%)",
        ].join(", "),
      },
    ],
  },
  {
    id: "ord-240411-051",
    orderNumber: "ORD-240411-051",
    seller: "Hoàng An Decor",
    placedAt: "11/04/2026 · 11:05",
    status: "delivered",
    deliveryWindow: "Đã giao thành công ngày 13/04/2026",
    paymentMethod: "Ví VNSEEA",
    shippingAddress: "36 Xuân Diệu, Tây Hồ, Hà Nội",
    shippingFee: 0,
    total: 1850000,
    items: [
      {
        id: "i-5",
        name: "Bàn trà gỗ sồi",
        quantity: 1,
        price: 1850000,
        imageStyle: [
          "radial-gradient(circle at 76% 10%, rgba(255,255,255,0.22), transparent 18%)",
          "linear-gradient(150deg, #78350f 0%, #b45309 38%, #f59e0b 100%)",
        ].join(", "),
      },
    ],
  },
  {
    id: "ord-240406-019",
    orderNumber: "ORD-240406-019",
    seller: "Beauty Lab",
    placedAt: "06/04/2026 · 08:50",
    status: "cancelled",
    deliveryWindow: "Đơn đã hủy theo yêu cầu của người mua",
    paymentMethod: "Hoàn về ví VNSEEA",
    shippingAddress: "92 Lê Lợi, Ninh Kiều, Cần Thơ",
    shippingFee: 0,
    total: 520000,
    items: [
      {
        id: "i-6",
        name: "Combo dưỡng tóc Yaskey",
        quantity: 1,
        price: 520000,
        imageStyle: [
          "radial-gradient(circle at 24% 18%, rgba(255,255,255,0.3), transparent 18%)",
          "linear-gradient(140deg, #0f766e 0%, #14b8a6 45%, #99f6e4 100%)",
        ].join(", "),
      },
    ],
  },
])

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
