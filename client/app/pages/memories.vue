<template>
  <MemoriesRoutePage />
</template>

<script setup lang="ts">
import { useMemoriesSeo } from "../../src/memories/application/composables/useMemoriesSeo"
import MemoriesRoutePage from "../components/pages/MemoriesPage.vue"

definePageMeta({
  layout: "default",
})

useMemoriesSeo()
</script>
