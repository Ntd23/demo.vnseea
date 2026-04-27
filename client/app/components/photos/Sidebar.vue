<template>
  <PhotosPresentationSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import PhotosPresentationSidebar from "../../../src/photos/presentation/components/Sidebar.vue"

defineOptions({ inheritAttrs: false })
</script>
