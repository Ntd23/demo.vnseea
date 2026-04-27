<template>
  <OrdersOrderPriceSummary :order="order" :card-class="cardClass" />
</template>

<script setup lang="ts">
import OrdersOrderPriceSummary from "../../../src/orders/presentation/components/OrdersOrderPriceSummary.vue"
import type { OrderPresentationShape } from "../../../types/orders"

withDefaults(defineProps<{
  order: OrderPresentationShape
  cardClass?: string
}>(), {
  cardClass: "rounded-[22px] bg-white/85 px-4 py-4 shadow-[0_8px_18px_rgba(15,35,110,0.04)]",
})
</script>
