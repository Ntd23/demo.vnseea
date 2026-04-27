<template>
  <PhotosPresentationHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import PhotosPresentationHero from "../../../src/photos/presentation/components/Hero.vue"

defineOptions({ inheritAttrs: false })
</script>
