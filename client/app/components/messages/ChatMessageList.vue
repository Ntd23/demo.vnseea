<template>
  <MessagesPresentationChatMessageList v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationChatMessageList from "../../../src/messages/presentation/components/ChatMessageList.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
