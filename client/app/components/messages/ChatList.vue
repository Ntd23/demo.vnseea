<template>
  <MessagesPresentationChatList v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationChatList from "../../../src/messages/presentation/components/ChatList.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
