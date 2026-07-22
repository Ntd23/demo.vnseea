<template>
  <PhotosPresentationPhotoPostsPage v-if="isPhotoFeedView" />
  <PhotosPresentationPhotosPage v-else />
</template>

<script setup lang="ts">
import PhotosPresentationPhotosPage from "../../src/photos/presentation/pages/PhotosPage.vue"
import PhotosPresentationPhotoPostsPage from "../../src/photos/presentation/pages/PhotoPostsPage.vue"

const route = useRoute()
const isPhotoFeedView = computed(() => route.query.view === "feed")

definePageMeta({
  layout: "default",
})
</script>
