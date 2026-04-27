<template>
  <CheckoutPresentationLayout v-bind="$props">
    <template #left>
      <slot name="left" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </CheckoutPresentationLayout>
</template>

<script setup lang="ts">
import CheckoutPresentationLayout from "../../../src/checkout/presentation/components/CheckoutLayout.vue"
/**
 * Legacy wrapper for CheckoutLayout.
 * Runtime has been moved to src/checkout/presentation/components/CheckoutLayout.vue
 */
defineProps<{
  title: string
  eyebrow?: string
  description?: string
  progressLabel?: string
  progressText?: string
  progressValue?: number
  leftLabel?: string
  rightLabel?: string
}>()
</script>
