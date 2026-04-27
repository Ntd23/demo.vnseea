<template>
  <OrdersOverviewSidebar
    :cards="cards"
    :next-order="nextOrder"
    :active-filter-label="activeFilterLabel"
    :visible-count="visibleCount"
  />
</template>

<script setup lang="ts">
import OrdersOverviewSidebar from "../../../src/orders/presentation/components/OrdersOverviewSidebar.vue"
import type { BuyerOrder, OrdersOverviewCard } from "../../../types/orders"

defineProps<{
  cards: OrdersOverviewCard[]
  nextOrder: BuyerOrder | null
  activeFilterLabel: string
  visibleCount: number
}>()
</script>
