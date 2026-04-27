<template>
  <ExploreRoutePage />
</template>

<script setup lang="ts">
import ExploreRoutePage from "../components/pages/ExplorePage.vue"
import { useExploreSeo } from "../../src/explore/application/composables/useExploreSeo"

definePageMeta({
  layout: "default",
})

useExploreSeo()
</script>
