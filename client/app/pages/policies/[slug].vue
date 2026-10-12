<!-- English description: Thin route wrapper for VNSEEA's public commerce policy pages. -->
<template>
  <CmsPresentationCommercePolicyPage />
</template>

<script setup lang="ts">
import CmsPresentationCommercePolicyPage from "../../../src/cms/presentation/pages/CommercePolicyPage.vue"

definePageMeta({ layout: "public" })
</script>
