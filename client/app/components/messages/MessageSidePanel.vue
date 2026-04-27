<template>
  <MessagesPresentationMessageSidePanel :participant="selectedContact" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { useMessagesWorkspace } from "../../../src/messages/application/composables/useMessagesWorkspace"
import MessagesPresentationMessageSidePanel from "../../../src/messages/presentation/components/MessageSidePanel.vue"

const { selectedContact } = useMessagesWorkspace()
</script>
