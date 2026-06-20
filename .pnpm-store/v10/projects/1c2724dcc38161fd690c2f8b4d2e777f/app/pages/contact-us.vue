<!-- English description: Thin Nuxt route wrapper for the public contact-us page. -->
<template>
  <CmsPresentationContactPage />
</template>

<script setup lang="ts">
import CmsPresentationContactPage from "../../src/cms/presentation/pages/ContactPage.vue"

definePageMeta({
  layout: "public",
})
</script>
