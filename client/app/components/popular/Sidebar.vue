<template>
  <PopularPresentationSidebar v-bind="$attrs" />
</template>

<script setup lang="ts">
import PopularPresentationSidebar from "../../../src/popular/presentation/components/Sidebar.vue"

defineOptions({ inheritAttrs: false })
</script>
