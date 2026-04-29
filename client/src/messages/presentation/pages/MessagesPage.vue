<template>
  <div class="mx-auto h-full min-h-0 max-w-[1440px] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-3 lg:p-4">
    <div
      class="grid h-full min-h-0 gap-4"
      :class="infoPanelOpen ? 'xl:grid-cols-[360px_minmax(0,1fr)_300px]' : 'xl:grid-cols-[360px_minmax(0,1fr)]'"
    >
      <aside class="hidden min-h-0 xl:block">
        <MessagesChatList
          v-model:active-tab="activeTab"
          :contacts="filteredContacts"
          :tabs="tabs"
          @select-user="selectContact"
        />
      </aside>

      <section class="min-h-0 min-w-0">
        <MessagesChatWindow
          :contact="selectedContact"
          :messages="messages"
          :is-typing="isTyping"
          @toggle-info="infoPanelOpen = !infoPanelOpen"
          @load-more="loadOlderMessages"
          @send="sendMessage"
        />
      </section>

      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="translate-x-8 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-8 opacity-0"
      >
        <aside v-if="infoPanelOpen" class="hidden min-h-0 xl:block">
          <MessagesMessageSidePanel :contact="selectedContact" />
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import MessagesChatList from "../components/ChatList.vue"
import MessagesChatWindow from "../components/ChatWindow.vue"
import MessagesMessageSidePanel from "../components/MessageSidePanel.vue"
import { useMessagesInbox } from "../../application/composables/useMessagesInbox"

const infoPanelOpen = ref(false)
const {
  activeTab,
  filteredContacts,
  isTyping,
  loadOlderMessages,
  messages,
  selectedContact,
  selectContact,
  sendMessage,
  tabs,
} = useMessagesInbox()

watch(selectedContact, () => {
  infoPanelOpen.value = false
})
</script>
