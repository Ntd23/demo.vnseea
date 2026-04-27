<template>
  <OrdersDetailTimelineCard :events="events" />
</template>

<script setup lang="ts">
import OrdersDetailTimelineCard from "../../../src/orders/presentation/components/OrdersDetailTimelineCard.vue"
import type { OrderTimelineEntry } from "../../../types/orders"

defineProps<{
  events: OrderTimelineEntry[]
}>()
</script>
