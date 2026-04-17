<template>
  <PagesSettingsPage :page-slug="pageSlug" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
})

const route = useRoute()
const pageSlug = computed(() => {
  const value = route.params.page
  return Array.isArray(value) ? value[0] : String(value ?? "")
})
</script>
