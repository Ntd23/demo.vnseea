<template>
  <MessagesPresentationChatList
    v-model:active-tab="activeTab"
    :tabs="tabs"
    :users="contacts"
    :result-count="contacts.length"
    @select-user="onSelectUser"
    @send="$emit('send')"
  />
</template>

<script setup lang="ts">
import type { MessageContact } from "../../../src/messages/domain/types/message.types"
import { useMessagesWorkspace } from "../../../src/messages/application/composables/useMessagesWorkspace"
import MessagesPresentationChatList from "../../../src/messages/presentation/components/ChatList.vue"

const emit = defineEmits<{
  "select-user": [user: MessageContact]
  send: []
}>()

const {
  activeTab,
  contacts,
  selectContact,
  tabs,
} = useMessagesWorkspace()

function onSelectUser(user: MessageContact) {
  selectContact(user)
  emit("select-user", user)
}
</script>
