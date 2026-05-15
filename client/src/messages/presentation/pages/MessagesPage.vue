<!-- Description: Renders the messages screen with the same left-list, center-thread, and right-info pane order as the PHP template. -->
<template>
  <div class="mx-auto h-full min-h-0 w-full max-w-[1440px] p-3 lg:p-4">
    <div class="grid h-full min-h-0 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_280px]">
    <!-- LEFT PANE: Chat List -->
    <aside
      class="min-h-0"
      :class="[mobileListOpen ? 'block' : 'hidden md:block']"
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
      class="min-h-0 min-w-0 flex-col"
      :class="[mobileListOpen ? 'hidden md:flex' : 'flex']"
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

      <div v-if="infoPanelOpen" class="mt-4 xl:hidden">
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
      class="hidden min-h-0 xl:block"
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
          <div class="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
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
