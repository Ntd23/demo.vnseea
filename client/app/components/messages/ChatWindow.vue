<template>
  <MessagesPresentationChatWindow v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationChatWindow from "../../../src/messages/presentation/components/ChatWindow.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
