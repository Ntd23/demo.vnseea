<template>
  <LightboxPresentationModal v-bind="$attrs" />
</template>

<script setup lang="ts">
import LightboxPresentationModal from "../../../src/lightbox/presentation/components/LightboxModal.vue"

defineOptions({ inheritAttrs: false })
</script>
