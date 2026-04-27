<template>
  <SavedPresentationPostCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import SavedPresentationPostCard from "../../../src/saved/presentation/components/PostCard.vue"

defineOptions({ inheritAttrs: false })
</script>
