<template>
  <MessagesPresentationChatBubble v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationChatBubble from "../../../src/messages/presentation/components/ChatBubble.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
