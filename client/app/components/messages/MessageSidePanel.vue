<template>
  <MessagesPresentationMessageSidePanel v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationMessageSidePanel from "../../../src/messages/presentation/components/MessageSidePanel.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
