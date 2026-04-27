<template>
  <div class="space-y-5 pb-10">
    <CheckoutLayout
      :eyebrow="$t('orders.page.eyebrow')"
      :title="$t('orders.page.layoutTitle')"
      :description="$t('orders.page.layoutDescription')"
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
            :title="$t('orders.empty.noMatchedTitle')"
            :description="$t('orders.empty.noMatchedDesc')"
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
import FoundationEmptyState from "../../../foundation/presentation/components/EmptyState.vue"
import CheckoutLayout from "../../../checkout/presentation/components/CheckoutLayout.vue"
import { useBuyerOrders } from "../../application/composables/useBuyerOrders"
import { buyerOrderFilterLabels } from "../../domain/types/orders.types"
import type {
  BuyerOrderFilter,
  OrdersFilterOption,
  OrdersOverviewCard,
} from "../../domain/types/orders.types"
import OrdersBuyerOrderCard from "../components/BuyerOrderCard.vue"
import OrdersFilterBar from "../components/FilterBar.vue"
import OrdersOverviewSidebar from "../components/OverviewSidebar.vue"

const { t } = useI18n()

useSeoMeta({
  title: t("orders.page.title"),
  description: t("orders.page.description"),
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
    label: "orders.status.pending.label",
    value: String(orders.value.filter(order => order.status === "pending").length),
    description: "orders.status.pending.description",
    icon: "i-ph-hourglass-medium-fill",
    tone: "amber",
  },
  {
    label: "orders.status.shipping.label",
    value: String(orders.value.filter(order => order.status === "shipping").length),
    description: "orders.status.shipping.description",
    icon: "i-ph-truck-fill",
    tone: "blue",
  },
  {
    label: "orders.status.delivered.label",
    value: String(orders.value.filter(order => order.status === "delivered").length),
    description: "orders.status.delivered.description",
    icon: "i-ph-check-circle-fill",
    tone: "green",
  },
  {
    label: "orders.status.cancelled.label",
    value: String(orders.value.filter(order => order.status === "cancelled").length),
    description: "orders.status.cancelled.description",
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
