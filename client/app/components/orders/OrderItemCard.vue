<template>
  <OrdersOrderItemCard
    :item="item"
    :seller="seller"
    :payment-method="paymentMethod"
    :meta-text="metaText"
    :variant="variant"
  />
</template>

<script setup lang="ts">
import OrdersOrderItemCard from "../../../src/orders/presentation/components/OrdersOrderItemCard.vue"
import type { OrderItem } from "../../../types/orders"

withDefaults(defineProps<{
  item: OrderItem
  seller?: string
  paymentMethod?: string
  metaText?: string
  variant?: "compact" | "detail"
}>(), {
  seller: "",
  paymentMethod: "",
  metaText: "",
  variant: "compact",
})
</script>
