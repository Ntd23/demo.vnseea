<template>
  <PagesEditProductPage :product-id="productId" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const route = useRoute()
const productId = computed(() => String(route.params.id || ""))

useHead({
  title: () => `Sửa sản phẩm #${productId.value} | VNSEEA`,
})
</script>
