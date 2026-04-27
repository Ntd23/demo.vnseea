<template>
  <PopularRoutePage />
</template>

<script setup lang="ts">
import { usePopularSeo } from "../../src/popular/application/composables/usePopularSeo"
import PopularRoutePage from "../components/pages/PopularPage.vue"

definePageMeta({
  layout: "default",
})

usePopularSeo()
</script>
