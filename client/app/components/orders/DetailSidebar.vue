<template>
  <OrdersDetailSidebar :order="order" />
</template>

<script setup lang="ts">
import OrdersDetailSidebar from "../../../src/orders/presentation/components/OrdersDetailSidebar.vue"
import type { BuyerOrder } from "../../../types/orders"

defineProps<{
  order: BuyerOrder
}>()
</script>
