<template>
  <CheckoutSummaryPresentation
    v-bind="$attrs"
    @increase-quantity="$emit('increaseQuantity', $event)"
    @decrease-quantity="$emit('decreaseQuantity', $event)"
    @remove-item="$emit('removeItem', $event)"
    @submit="$emit('submit')"
  />
</template>

<script setup lang="ts">
import CheckoutSummaryPresentation from "../../../src/checkout/presentation/components/CheckoutSummary.vue"

defineEmits<{
  increaseQuantity: [itemId: string]
  decreaseQuantity: [itemId: string]
  removeItem: [itemId: string]
  submit: []
}>()
</script>
