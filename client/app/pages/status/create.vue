<template>
  <PagesStatusCreatePage />
</template>

<script setup lang="ts">
import PagesStatusCreatePage from "../../../src/pages/presentation/pages/StatusCreatePage.vue"

definePageMeta({
  layout: "default",
})

useHead({
  title: "Tạo story | VNSEEA",
})
</script>
