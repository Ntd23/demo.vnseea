<template>
  <PhotosPresentationFilters v-bind="$attrs" />
</template>

<script setup lang="ts">
import PhotosPresentationFilters from "../../../src/photos/presentation/components/Filters.vue"

defineOptions({ inheritAttrs: false })
</script>
