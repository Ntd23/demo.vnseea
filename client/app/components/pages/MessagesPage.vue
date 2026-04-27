<template>
  <MessagesPresentationMessagesPage v-bind="$attrs" />
</template>

<script setup lang="ts">
import MessagesPresentationMessagesPage from "../../../src/messages/presentation/pages/MessagesPage.vue"

defineOptions({
  inheritAttrs: false,
})
</script>
