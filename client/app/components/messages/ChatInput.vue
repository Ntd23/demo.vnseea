<template>
  <MessagesPresentationChatInput v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationChatInput from "../../../src/messages/presentation/components/ChatInput.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
