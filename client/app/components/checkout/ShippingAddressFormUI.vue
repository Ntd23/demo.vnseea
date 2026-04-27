<template>
  <ShippingAddressFormPresentation
    v-bind="$attrs"
    @submit="$emit('submit', $event)"
  />
</template>

<script setup lang="ts">
import ShippingAddressFormPresentation from "../../../src/checkout/presentation/components/ShippingAddressFormUI.vue"

defineEmits<{
  submit: [address: unknown]
}>()
</script>
