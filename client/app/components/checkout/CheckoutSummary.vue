<template>
  <CheckoutPresentationSummary
    v-bind="$props"
    @increase-quantity="emit('increaseQuantity', $event)"
    @decrease-quantity="emit('decreaseQuantity', $event)"
    @remove-item="emit('removeItem', $event)"
    @submit="emit('submit')"
  />
</template>

<script setup lang="ts">
import CheckoutPresentationSummary from "../../../src/checkout/presentation/components/CheckoutSummary.vue"
/**
 * Legacy wrapper for CheckoutSummary.
 * Runtime has been moved to src/checkout/presentation/components/CheckoutSummary.vue
 */
import type { CheckoutLineItem } from "~/types/checkout"

defineProps<{
  items: CheckoutLineItem[]
  walletBalance: number
  shippingFee?: number
  addressReady?: boolean
  checkoutState?: "idle" | "loading" | "success" | "error"
}>()

const emit = defineEmits<{
  increaseQuantity: [itemId: string]
  decreaseQuantity: [itemId: string]
  removeItem: [itemId: string]
  submit: []
}>()
</script>
