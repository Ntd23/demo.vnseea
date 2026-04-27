<template>
  <MessagesPresentationChatWindow
    v-model="inputModel"
    :messages="messages"
    :is-typing="isTyping"
    :participant="selectedContact"
    @send="sendMessage"
    @load-more="loadOlderMessages"
    @toggle-info="$emit('toggle-info')"
  />
</template>

<script setup lang="ts">
import { useMessagesWorkspace } from "../../../src/messages/application/composables/useMessagesWorkspace"
import MessagesPresentationChatWindow from "../../../src/messages/presentation/components/ChatWindow.vue"

defineEmits<{
  "toggle-info": []
}>()

const {
  inputModel,
  isTyping,
  loadOlderMessages,
  messages,
  selectedContact,
  sendMessage,
} = useMessagesWorkspace()
</script>
