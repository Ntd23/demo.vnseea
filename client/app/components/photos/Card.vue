<template>
  <PhotosPresentationCard v-bind="$attrs" />
</template>

<script setup lang="ts">
import PhotosPresentationCard from "../../../src/photos/presentation/components/Card.vue"

defineOptions({ inheritAttrs: false })
</script>
