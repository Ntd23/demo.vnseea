<template>
  <OrdersBuyerOrderCard :order="order" />
</template>

<script setup lang="ts">
import OrdersBuyerOrderCard from "../../../src/orders/presentation/components/OrdersBuyerOrderCard.vue"
import type { BuyerOrder } from "../../../types/orders"

defineProps<{
  order: BuyerOrder
}>()
</script>
