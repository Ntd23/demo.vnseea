<!-- English description: Thin Nuxt route wrapper for the public custom CMS page index. -->
<template>
  <CmsPresentationCmsPagesIndexPage />
</template>

<script setup lang="ts">
import CmsPresentationCmsPagesIndexPage from "../../../src/cms/presentation/pages/CmsPagesIndexPage.vue"

definePageMeta({
  layout: "public",
  publicContent: true,
})
</script>
