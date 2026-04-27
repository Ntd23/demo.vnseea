<template>
  <PopularPresentationPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import PopularPresentationPage from "../../../src/popular/presentation/pages/PopularPage.vue"

defineOptions({ inheritAttrs: false })
</script>
