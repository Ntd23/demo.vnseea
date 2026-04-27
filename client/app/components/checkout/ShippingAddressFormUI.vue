<template>
  <CheckoutPresentationShippingAddressForm
    v-bind="$props"
    @submit="emit('submit', $event)"
  />
</template>

<script setup lang="ts">
import CheckoutPresentationShippingAddressForm from "../../../src/checkout/presentation/components/ShippingAddressFormUI.vue"
/**
 * Legacy wrapper for ShippingAddressFormUI.
 * Runtime has been moved to src/checkout/presentation/components/ShippingAddressFormUI.vue
 */
import type { SavedShippingAddress } from "~/types/checkout"

defineProps<{
  initialAddress?: SavedShippingAddress | null
}>()

const emit = defineEmits<{
  submit: [address: SavedShippingAddress]
}>()
</script>
