<!-- Description: Renders the messages screen with the same left-list, center-thread, and right-info pane order as the PHP template. -->
<template>
  <div class="h-full min-h-0 w-full bg-white">
    <div class="flex h-full min-h-0">
    <!-- LEFT PANE: Chat List -->
    <aside
      class="messages-page__left min-h-0 shrink-0 border-r border-[#e5e7eb] bg-white"
      :class="{ 'messages-page__left--mobile-hidden': !mobileListOpen }"
    >
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
        :marking-read="isMarkingRead"
        @create-group="openCreateGroupModal"
        @mark-all-read="markAllAsRead"
        @open-multi-composer="openMultiComposer"
        @select-user="handleSelectContact"
        @toggle-all-recipients="toggleAllVisibleRecipients"
      />
    </aside>

    <!-- CENTER PANE: Active Chat / Composer -->
    <main
      class="messages-page__main min-h-0 min-w-0 flex-1 flex-col bg-white"
      :class="{ 'messages-page__main--mobile-hidden': mobileListOpen }"
    >
      <MessagesMultiComposer
        v-if="activeTab === 'multi'"
        v-model:file="multiFile"
        v-model:text="multiText"
        :pending="isMultiSending"
        :recipients="selectedRecipients"
        :status-message="multiFeedbackMessage"
        :status-tone="multiFeedbackTone"
        @close="handleBackToList"
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
        :deleting-conversation="isDeletingConversation"
        @toggle-info="infoPanelOpen = !infoPanelOpen"
        @load-more="loadOlderMessages"
        @send="sendMessage"
        @delete-conversation="deleteSelectedConversation"
        @back="handleBackToList"
      />

      <div v-if="infoPanelOpen" class="border-t border-[#e5e7eb] xl:hidden">
        <MessagesMessageSidePanel
          :contact="selectedContact"
          :empty-description="infoEmptyDescription"
          :empty-title="infoEmptyTitle"
          :deleting-conversation="isDeletingConversation"
          @delete-conversation="deleteSelectedConversation"
        />
      </div>
    </main>

    <!-- RIGHT PANE: Info Panel (Desktop Only) -->
    <aside
      v-if="infoPanelOpen && selectedContact"
      class="hidden min-h-0 w-[320px] shrink-0 border-l border-[#e5e7eb] bg-white xl:block"
    >
      <MessagesMessageSidePanel
        :contact="selectedContact"
        :empty-description="infoEmptyDescription"
        :empty-title="infoEmptyTitle"
        :deleting-conversation="isDeletingConversation"
        @delete-conversation="deleteSelectedConversation"
      />
    </aside>
    </div>

    <!-- Group modal -->
    <UModal v-model:open="groupModalOpen" :title="$t('pages.messagesPage.groupCreateTitle')">
      <template #body>
        <div class="space-y-4">
          <div class="rounded-[18px] border border-(--border-light) bg-(--bg-muted) px-4 py-3 text-sm text-(--text-secondary)">
            {{ $t("pages.messagesPage.groupCreateDescription", { count: selectedRecipients.length }) }}
          </div>
          <UInput
            v-model="groupName"
            :placeholder="$t('pages.messagesPage.groupNamePlaceholder')"
            size="lg"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex w-full items-center justify-end gap-3">
          <UButton
            variant="soft"
            color="neutral"
            class="rounded-full px-4 font-semibold"
            @click="groupModalOpen = false"
          >
            {{ $t("pages.messagesPage.cancel") }}
          </UButton>
          <UButton
            class="rounded-full px-5 font-semibold"
            :loading="isCreatingGroup"
            :disabled="selectedRecipients.length === 0 || groupName.trim().length < 4"
            @click="submitCreateGroup"
          >
            {{ $t("pages.messagesPage.groupCreateSubmit") }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import MessagesChatList from "../components/ChatList.vue"
import MessagesMultiComposer from "../components/MultiComposer.vue"
import MessagesChatWindow from "../components/ChatWindow.vue"
import MessagesMessageSidePanel from "../components/MessageSidePanel.vue"
import { useMessagesInbox } from "../../application/composables/useMessagesInbox"
import type { MessageContact } from "../../domain/types/messages.types"

const { t } = useI18n()
const infoPanelOpen = ref(false)
const groupModalOpen = ref(false)
const groupName = ref("")
const mobileListOpen = ref(true)
const {
  activeTab,
  allVisibleRecipientsSelected,
  filteredContacts,
  inboxPending,
  isCreatingGroup,
  isDeletingConversation,
  isMarkingRead,
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
  createGroupChat,
  deleteSelectedConversation,
  markAllAsRead,
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

function openCreateGroupModal() {
  activeTab.value = "multi"
  mobileListOpen.value = true
  groupModalOpen.value = true
}

function openMultiComposer() {
  activeTab.value = "multi"
  mobileListOpen.value = false
}

async function handleSelectContact(contact: MessageContact) {
  await selectContact(contact)

  if (activeTab.value !== "multi") {
    mobileListOpen.value = false
  }
}

function handleBackToList() {
  mobileListOpen.value = true
  infoPanelOpen.value = false
}

async function submitCreateGroup() {
  const didCreate = await createGroupChat(groupName.value)

  if (didCreate) {
    groupModalOpen.value = false
    groupName.value = ""
  }
}
</script>

<style scoped>
.messages-page__left {
  width: min(520px, 100vw);
}

.messages-page__main {
  display: flex;
}

@media (min-width: 768px) {
  .messages-page__left {
    width: clamp(390px, 28vw, 520px);
  }
}

@media (max-width: 767.98px) {
  .messages-page__left--mobile-hidden,
  .messages-page__main--mobile-hidden {
    display: none;
  }
}
</style>
