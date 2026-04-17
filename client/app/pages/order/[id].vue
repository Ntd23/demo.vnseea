<template>
  <PagesOrderDetailPage :order-id="orderId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const route = useRoute()
const orderId = computed(() => String(route.params.id || ""))

useHead({
  title: () => `Chi tiết đơn #${orderId.value} | VNSEEA`,
})
</script>
