<template>
  <CheckoutLayoutPresentation v-bind="$attrs">
    <template #left>
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </CheckoutLayoutPresentation>
</template>

<script setup lang="ts">
import CheckoutLayoutPresentation from "../../../src/checkout/presentation/components/CheckoutLayout.vue"
</script>
