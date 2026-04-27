<template>
  <PhotosPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import PhotosPresentationPage from "../../../src/photos/presentation/pages/PhotosPage.vue"

defineOptions({ inheritAttrs: false })
</script>
