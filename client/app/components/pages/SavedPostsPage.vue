<template>
  <SavedPresentationPostsPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import SavedPresentationPostsPage from "../../../src/saved/presentation/pages/SavedPostsPage.vue"

defineOptions({ inheritAttrs: false })
</script>
