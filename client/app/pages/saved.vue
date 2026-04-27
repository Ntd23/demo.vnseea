<template>
  <SavedRoutePage />
</template>

<script setup lang="ts">
import { useSavedSeo } from "../../src/saved/application/composables/useSavedSeo"
import SavedRoutePage from "../components/pages/SavedPostsPage.vue"

definePageMeta({
  layout: "default",
})

useSavedSeo()
</script>
