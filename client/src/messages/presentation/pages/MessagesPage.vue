<!-- Description: Renders the messages screen with the same left-list, center-thread, and right-info pane order as the PHP template. -->
<template>
  <div class="mx-auto h-full min-h-0 max-w-[1440px] p-3 lg:p-4">
    <div class="grid h-full min-h-0 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_280px]">
      <aside class="min-h-0">
        <MessagesChatList
          v-model:active-tab="activeTab"
          v-model:query="query"
          :all-visible-recipients-selected="allVisibleRecipientsSelected"
          :contacts="filteredContacts"
          :pending="inboxPending"
          :selected-contact-id="selectedContact?.id"
          :selected-recipient-ids="selectedRecipientIds"
          :selected-recipients="selectedRecipients"
          :tabs="tabs"
          @select-user="selectContact"
          @toggle-all-recipients="toggleAllVisibleRecipients"
        />
      </aside>

      <section class="min-h-0 min-w-0 space-y-4">
        <MessagesMultiComposer
          v-if="activeTab === 'multi'"
          v-model:file="multiFile"
          v-model:text="multiText"
          :pending="isMultiSending"
          :recipients="selectedRecipients"
          :status-message="multiFeedbackMessage"
          :status-tone="multiFeedbackTone"
          @send="sendMultiMessage"
        />

        <MessagesChatWindow
          v-else
          :active-tab="activeTab"
          :contact="selectedContact"
          :empty-description="chatEmptyDescription"
          :empty-thread-label="emptyThreadLabel"
          :empty-title="chatEmptyTitle"
          :is-pending="threadPending"
          :is-typing="isTyping"
          :messages="messages"
          @toggle-info="infoPanelOpen = !infoPanelOpen"
          @load-more="loadOlderMessages"
          @send="sendMessage"
        />

        <div v-if="infoPanelOpen" class="xl:hidden">
          <MessagesMessageSidePanel
            :contact="selectedContact"
            :empty-description="infoEmptyDescription"
            :empty-title="infoEmptyTitle"
          />
        </div>
      </section>

      <aside class="hidden min-h-0 xl:block">
        <MessagesMessageSidePanel
          :contact="selectedContact"
          :empty-description="infoEmptyDescription"
          :empty-title="infoEmptyTitle"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import MessagesChatList from "../components/ChatList.vue"
import MessagesMultiComposer from "../components/MultiComposer.vue"
import MessagesChatWindow from "../components/ChatWindow.vue"
import MessagesMessageSidePanel from "../components/MessageSidePanel.vue"
import { useMessagesInbox } from "../../application/composables/useMessagesInbox"

const { t } = useI18n()
const infoPanelOpen = ref(false)
const {
  activeTab,
  allVisibleRecipientsSelected,
  filteredContacts,
  inboxPending,
  isMultiSending,
  isTyping,
  loadOlderMessages,
  messages,
  multiFeedbackMessage,
  multiFeedbackTone,
  multiFile,
  multiText,
  query,
  selectedContact,
  selectedRecipientIds,
  selectedRecipients,
  selectContact,
  sendMessage,
  sendMultiMessage,
  tabs,
  threadPending,
  toggleAllVisibleRecipients,
} = useMessagesInbox()

const chatEmptyTitle = computed(() =>
  activeTab.value === "multi"
    ? t("pages.messagesPage.multiTabTitle")
    : t("pages.messagesPage.noConversationSelectedTitle"),
)

const chatEmptyDescription = computed(() =>
  activeTab.value === "multi"
    ? t("pages.messagesPage.multiTabDescription")
    : t("pages.messagesPage.noConversationSelectedDescription"),
)

const infoEmptyTitle = computed(() =>
  activeTab.value === "multi"
    ? t("pages.messagesPage.multiTabTitle")
    : t("pages.messagesPage.infoPanelEmptyTitle"),
)

const infoEmptyDescription = computed(() =>
  activeTab.value === "multi"
    ? t("pages.messagesPage.multiTabDescription")
    : t("pages.messagesPage.infoPanelEmptyDescription"),
)

const emptyThreadLabel = computed(() =>
  t("pages.messagesPage.emptyThread"),
)

watch(selectedContact, () => {
  infoPanelOpen.value = false
})
</script>
