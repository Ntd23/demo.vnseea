<template>
  <FeedPresentationLightboxViewer v-bind="$attrs" />
</template>

<script setup lang="ts">
import FeedPresentationLightboxViewer from "../../../src/feed/presentation/components/LightboxViewer.vue"

defineOptions({ inheritAttrs: false })
</script>
