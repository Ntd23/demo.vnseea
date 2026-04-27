<template>
  <div class="h-full min-h-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_26%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_48%,#f9fbff_100%)] p-3 lg:p-4">
    <div
      class="grid h-full min-h-0 gap-4"
      :class="infoPanelOpen ? 'xl:grid-cols-[360px_minmax(0,1fr)_300px]' : 'xl:grid-cols-[360px_minmax(0,1fr)]'"
    >
      <aside class="hidden min-h-0 xl:block">
        <MessagesPresentationChatList
          v-model:active-tab="activeTab"
          :tabs="tabs"
          :users="contacts"
          :result-count="contacts.length"
          @select-user="selectContact"
        />
      </aside>

      <section class="min-h-0 min-w-0">
        <MessagesPresentationChatWindow
          v-model="inputModel"
          :messages="messages"
          :is-typing="isTyping"
          :participant="selectedContact"
          @send="sendMessage"
          @load-more="loadOlderMessages"
          @toggle-info="toggleInfoPanel"
        />
      </section>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-4"
      >
        <aside v-if="infoPanelOpen" class="hidden min-h-0 xl:block">
          <MessagesPresentationMessageSidePanel :participant="selectedContact" />
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessagesWorkspace } from "../../application/composables/useMessagesWorkspace"
import MessagesPresentationChatList from "../components/ChatList.vue"
import MessagesPresentationChatWindow from "../components/ChatWindow.vue"
import MessagesPresentationMessageSidePanel from "../components/MessageSidePanel.vue"

const {
  activeTab,
  contacts,
  infoPanelOpen,
  inputModel,
  isTyping,
  messages,
  selectedContact,
  tabs,
  loadOlderMessages,
  selectContact,
  sendMessage,
  toggleInfoPanel,
} = useMessagesWorkspace()
</script>
