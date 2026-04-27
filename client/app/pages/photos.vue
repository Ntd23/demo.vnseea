<template>
  <PhotosRoutePage />
</template>

<script setup lang="ts">
import { usePhotosSeo } from "../../src/photos/application/composables/usePhotosSeo"
import PhotosRoutePage from "../components/pages/PhotosPage.vue"

definePageMeta({
  layout: "default",
})

usePhotosSeo()
</script>
