<template>
  <PopularPresentationHero v-bind="$attrs" />
</template>

<script setup lang="ts">
import PopularPresentationHero from "../../../src/popular/presentation/components/Hero.vue"

defineOptions({ inheritAttrs: false })
</script>
