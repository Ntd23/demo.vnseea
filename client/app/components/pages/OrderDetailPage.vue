<template>
  <OrderDetailPresentationPage :order-id="orderId" />
</template>

<script setup lang="ts">
import OrderDetailPresentationPage from "../../../src/orders/presentation/pages/OrderDetailPage.vue"
/**
 * Legacy wrapper for OrderDetailPage.
 * Runtime has been moved to src/orders/presentation/pages/OrderDetailPage.vue
 */

defineProps<{
  orderId: string
}>()
</script>


<style scoped>
/** Fixed CSS parsing error by providing explicit style block */
</style>

