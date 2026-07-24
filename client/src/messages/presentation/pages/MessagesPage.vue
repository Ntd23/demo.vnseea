<!-- English description: Renders the messages workspace with a docked desktop user detail pane while preserving mobile slideovers and group management flows. -->
<template>
  <div class="h-full min-h-0 w-full overflow-hidden bg-[var(--bg-surface)]">
    <div class="flex h-full min-h-0 overflow-hidden">
      <aside
        class="messages-page__left h-full min-h-0 shrink-0 border-r border-[var(--border-light)] bg-[var(--bg-surface)]"
        :class="{ 'messages-page__left--mobile-hidden': !mobileListOpen }"
      >
        <MessagesChatList
          v-model:active-tab="activeTab"
          v-model:query="query"
          v-model:multi-text="multiText"
          v-model:multi-file="multiFile"
          v-model:multi-record="multiRecord"
          :multi-pending="isMultiSending"
          :status-message="multiFeedbackMessage"
          :status-tone="multiFeedbackTone"
          :all-visible-recipients-selected="allVisibleRecipientsSelected"
          :contacts="filteredContacts"
          :is-contact-online="isContactOnline"
          :is-contact-typing="isContactTyping"
          :message-tag-labels="messageTagLabels"
          :active-tag-filter="activeTagFilter"
          :pending="inboxPending"
          :selected-contact-id="selectedContact?.id"
          :selected-recipient-ids="selectedRecipientIds"
          :selected-recipients="selectedRecipients"
          :tabs="tabs"
          :marking-read="isMarkingRead"
          @create-group="openCreateGroupModal"
          @mark-all-read="markAllAsRead"
          @select-user="handleSelectContact"
          @toggle-all-recipients="toggleAllVisibleRecipients"
          @send-multi="sendMultiMessage"
          @manage-tags="openTagModal"
          @update:selected-recipient-ids="setSelectedRecipientIds"
          @update:active-tag-filter="setActiveTagFilter"
          @open-chat="handleOpenChatFromMulti"
        />
      </aside>

      <main
        class="messages-page__main h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--bg-surface)]"
        :class="{ 'messages-page__main--mobile-hidden': mobileListOpen }"
      >
        <MessagesChatWindow
          :active-tab="activeTab"
          :contact="selectedContact"
          :empty-description="chatEmptyDescription"
          :empty-title="chatEmptyTitle"
          :group-details="groupDetails"
          :group-typing-avatar-url="activeGroupTypingAvatarUrl"
          :inbox-pending="inboxPending"
          :is-pending="threadPending"
          :is-typing="isTyping"
          :messages="messages"
          :thread-key="selectedThreadKey"
          :active-reaction-picker-id="activeReactionPickerId"
          :reply-target="replyTarget"
          :reply-title="replyTitle"
          :reply-preview-text="replyPreviewText"
          :reply-preview-media-url="replyPreviewMediaUrl"
          :call-action-pending="isCallActionPending"
          :deleting-conversation="isDeletingConversation"
          :user-detail-docked="showDesktopUserDetailPane"
          :product-card="productCard"
          :product-context-pending="productContextPending"
          :product-suggestions="productSuggestions"
          @typing-start="startComposerTyping"
          @typing-stop="stopComposerTyping"
          @toggle-info="infoPanelOpen = !infoPanelOpen"
          @load-more="loadOlderMessages"
          @send="handleSendMessage"
          @send-product-suggestion="handleSendProductSuggestion"
          @dismiss-product-context="dismissProductContext"
          @toggle-reaction-picker="toggleReactionPicker"
          @select-reaction="reactToThreadMessage"
          @reply-message="replyToThreadMessage"
          @delete-message="deleteThreadMessage"
          @clear-reply="clearReplyTarget"
          @start-call="startSelectedContactCall"
          @delete-conversation="deleteSelectedConversation"
          @back="handleBackToList"
        />
      </main>

      <aside
        v-if="showDesktopUserDetailPane"
        class="messages-page__detail hidden h-full min-h-0 shrink-0 border-l border-[var(--border-light)] bg-[var(--bg-surface)] xl:flex"
      >
        <MessagesUserDetailPanel
          :contact="selectedContact"
          :deleting-conversation="isDeletingConversation"
          :empty-description="infoEmptyDescription"
          :empty-title="infoEmptyTitle"
          @delete-conversation="deleteSelectedConversation"
        />
      </aside>
    </div>

    <USlideover
      v-if="selectedContact"
      v-model:open="infoPanelOpen"
      :title="infoPanelTitle"
      :ui="{
        content: 'sm:max-w-[380px] p-0',
        body: 'p-0 sm:p-0',
      }"
    >
      <template #body>
        <div class="h-[100dvh] sm:h-full">
          <MessagesUserDetailPanel
            v-if="selectedContact.type === 'user'"
            :contact="selectedContact"
            :deleting-conversation="isDeletingConversation"
            :empty-description="infoEmptyDescription"
            :empty-title="infoEmptyTitle"
            @delete-conversation="deleteSelectedConversation"
          />
          <MessagesMessageSidePanel
            v-else
            :contact="selectedContact"
            :group-candidate-query="groupCandidateQuery"
            :group-candidates="groupCandidates"
            :group-candidates-pending="groupCandidatesPending"
            :group-details="groupDetails"
            :group-details-pending="groupDetailsPending"
            :messages="messages"
            :updating-group-details="isUpdatingGroupDetails"
            :updating-group-members="isUpdatingGroupMembers"
            :empty-description="infoEmptyDescription"
            :empty-title="infoEmptyTitle"
            :deleting-conversation="isDeletingConversation"
            @update:group-candidate-query="updateGroupCandidateQuery"
            @update-group="updateGroupDetails"
            @add-group-member="addGroupMember"
            @add-group-members="addGroupMembers"
            @remove-group-member="removeGroupMember"
            @delete-conversation="deleteSelectedConversation"
          />
        </div>
      </template>
    </USlideover>

    <MessagesCreateGroupModal
      v-model:open="createGroupOpenModel"
      v-model:name="createGroupName"
      v-model:query="createGroupQuery"
      v-model:avatar="createGroupAvatarModel"
      :avatar-preview-url="createGroupAvatarPreviewUrl"
      :candidates="createGroupCandidates"
      :error-message="createGroupErrorMessage"
      :pending="isCreatingGroup"
      :search-pending="createGroupCandidatesPending"
      :selected-candidates="createGroupSelectedCandidates"
      @select-candidate="addCreateGroupParticipant"
      @remove-candidate="removeCreateGroupParticipant"
      @submit="submitCreateGroup"
    />

    <MessagesTagModal
      v-model:open="tagModalOpen"
      :labels="messageTagLabels"
      :selected-ids="tagModalSelectedIds"
      :pending="isUpdatingTags"
      :update-selection="updateContactTagSelection"
      :create-tag="createTagLabel"
      :delete-tag="deleteTagLabel"
    />

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import MessagesChatList from "../components/ChatList.vue"
import MessagesCreateGroupModal from "../components/CreateGroupModal.vue"
import MessagesChatWindow from "../components/ChatWindow.vue"
import MessagesTagModal from "../components/MessageTagsModal.vue"
import MessagesMessageSidePanel from "../components/MessageSidePanel.vue"
import MessagesUserDetailPanel from "../components/UserDetailPanel.vue"
import { useMessageCalls } from "../../application/composables/useMessageCalls"
import { useMessagesPageVM } from "../../application/view-models/useMessagesPageVM"
import { useMessagesProductContext } from "../../application/composables/useMessagesProductContext"
import type { MessageCallLogAction, MessageCallType } from "../../domain/types/calls.types"
import type { MessageContact } from "../../domain/types/messages.types"

const { t } = useI18n()
const infoPanelOpen = ref(false)
const tagModalOpen = ref(false)
const tagModalContact = ref<MessageContact | null>(null)
const mobileListOpen = ref(true)
const {
  isCallActionPending,
  joinGroupCall,
  startCall,
  startGroupCall,
} = useMessageCalls()
const {
  activeGroupTypingAvatarUrl,
  activeReactionPickerId,
  activeTagFilter,
  activeTab,
  addCreateGroupParticipant,
  addGroupMember,
  addGroupMembers,
  attachTag,
  allVisibleRecipientsSelected,
  closeCreateGroupModal,
  clearReplyTarget,
  createGroupAvatarFile,
  createGroupAvatarPreviewUrl,
  createGroupCandidates,
  createGroupCandidatesPending,
  createGroupErrorMessage,
  createGroupModalOpen,
  createGroupName,
  createGroupQuery,
  createGroupSelectedCandidates,
  filteredContacts,
  groupCandidateQuery,
  groupCandidates,
  groupCandidatesPending,
  groupDetails,
  groupDetailsPending,
  inboxPending,
  isContactTyping,
  isContactOnline,
  isCreatingGroup,
  isDeletingConversation,
  isMarkingRead,
  isUpdatingGroupDetails,
  isMultiSending,
  isTyping,
  isUpdatingGroupMembers,
  loadOlderMessages,
  messages,
  messageTagLabels,
  multiFeedbackMessage,
  multiFeedbackTone,
  multiFile,
  multiRecord,
  multiText,
  openCreateGroupModal: openCreateGroupModalVm,
  query,
  removeCreateGroupParticipant,
  removeGroupMember,
  reactToThreadMessage,
  replyPreviewMediaUrl,
  replyPreviewText,
  replyTarget,
  replyTitle,
  selectedContact,
  selectedRecipientIds,
  selectedRecipients,
  createTagLabel,
  deleteSelectedConversation,
  deleteThreadMessage,
  deleteTagLabel,
  detachTag,
  markAllAsRead,
  isUpdatingTags,
  selectContact,
  setActiveTagFilter,
  setSelectedRecipientIds,
  setCreateGroupAvatar,
  replyToThreadMessage,
  sendMessage,
  sendMultiMessage,
  submitCreateGroup,
  updateGroupDetails,
  startComposerTyping,
  stopComposerTyping,
  tabs,
  threadPending,
  toggleAllVisibleRecipients,
  toggleReactionPicker,
} = useMessagesPageVM()

const {
  decorateProductMessage,
  dismissProductContext,
  productCard,
  productContextPending,
  productSuggestions,
  requestedProductId,
  requestedSellerId,
} = useMessagesProductContext(selectedContact)

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



const showDesktopUserDetailPane = computed(() =>
  activeTab.value === "user" && selectedContact.value?.type === "user",
)

const infoPanelTitle = computed(() =>
  selectedContact.value?.type === "user"
    ? t("pages.messagesPage.profile")
    : t("pages.messagesPage.info"),
)

const createGroupOpenModel = computed({
  get: () => createGroupModalOpen.value,
  set: (value: boolean) => {
    if (value) {
      openCreateGroupModalVm()
      return
    }

    closeCreateGroupModal()
  },
})

const createGroupAvatarModel = computed({
  get: () => createGroupAvatarFile.value,
  set: (value: File | null) => {
    setCreateGroupAvatar(value ?? null)
  },
})

const tagModalLiveContact = computed(() => {
  const userId = tagModalContact.value?.userId ?? 0

  return filteredContacts.value.find(contact => contact.userId === userId)
    ?? tagModalContact.value
})

const tagModalSelectedIds = computed(() =>
  tagModalLiveContact.value?.tags?.map(tag => tag.id) ?? [],
)

const selectedThreadKey = computed(() =>
  selectedContact.value
    ? `${selectedContact.value.type}:${selectedContact.value.userId ?? selectedContact.value.groupId ?? selectedContact.value.id}`
    : "",
)

watch(selectedThreadKey, () => {
  infoPanelOpen.value = false
})

const openedRequestedConversationKey = ref("")
const requestedConversationKey = computed(() =>
  requestedSellerId.value > 0
    ? `${requestedSellerId.value}:${requestedProductId.value}`
    : "",
)

watch(
  [requestedConversationKey, () => selectedContact.value?.userId],
  ([requestKey, selectedUserId]) => {
    if (
      requestKey
      && selectedUserId === requestedSellerId.value
      && openedRequestedConversationKey.value !== requestKey
    ) {
      mobileListOpen.value = false
      openedRequestedConversationKey.value = requestKey
    }
  },
  { immediate: true, flush: "post" },
)

watch(showDesktopUserDetailPane, (value) => {
  if (value) {
    infoPanelOpen.value = false
  }
})

function openCreateGroupModal() {
  mobileListOpen.value = true
  openCreateGroupModalVm()
}

async function handleSelectContact(contact: MessageContact) {
  await selectContact(contact)

  if (activeTab.value !== "multi") {
    mobileListOpen.value = false
  }
}

function handleOpenChatFromMulti(contact: MessageContact) {
  activeTab.value = "user"
  handleSelectContact(contact)
}

function handleBackToList() {
  mobileListOpen.value = true
  infoPanelOpen.value = false
}

function handleSendMessage(input: Parameters<typeof sendMessage>[0]) {
  if (productCard.value) {
    clearReplyTarget()
  }

  sendMessage(decorateProductMessage(input))

  if (productCard.value) {
    dismissProductContext()
  }
}

function handleSendProductSuggestion(text: string) {
  handleSendMessage({ text })
}

async function startSelectedContactCall(input: MessageCallType | MessageCallLogAction) {
  if (typeof input === "object" && input.action === "join" && input.callId) {
    await joinGroupCall(input.callId)
    return
  }

  const type = typeof input === "object" ? input.type : input
  const contact = selectedContact.value

  if (!contact) {
    return
  }

  if (contact.type === "group") {
    await startGroupCall(contact)
    return
  }

  if (contact.type === "user") {
    await startCall(contact, type)
  }
}

function updateGroupCandidateQuery(value: string) {
  groupCandidateQuery.value = value
}

function openTagModal(contact: MessageContact) {
  tagModalContact.value = contact
  tagModalOpen.value = true
}

function contactHasTag(tagId: number) {
  return Boolean(tagModalLiveContact.value?.tags?.some(tag => tag.id === tagId))
}

async function toggleContactTag(tagId: number) {
  const contact = tagModalLiveContact.value

  if (!contact) {
    return
  }

  if (contactHasTag(tagId)) {
    await detachTag(contact, tagId)
  }
  else {
    await attachTag(contact, tagId)
  }
}

async function updateContactTagSelection(nextValue: number[] | undefined) {
  if (isUpdatingTags.value) {
    return
  }

  const currentIds = new Set(tagModalSelectedIds.value)
  const nextIds = new Set(Array.isArray(nextValue) ? nextValue : [])
  const changedTag = messageTagLabels.value.find(tag => currentIds.has(tag.id) !== nextIds.has(tag.id))

  if (changedTag) {
    await toggleContactTag(changedTag.id)
  }
}

</script>

<style scoped>
.messages-page__left {
  width: min(520px, 100vw);
  height: 100%;
  overflow: hidden;
}

.messages-page__main {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.messages-page__detail {
  width: 320px;
}

@media (min-width: 768px) {
  .messages-page__left {
    width: clamp(390px, 28vw, 520px);
  }
}

@media (min-width: 1536px) {
  .messages-page__detail {
    width: 360px;
  }
}

@media (max-width: 767.98px) {
  .messages-page__left--mobile-hidden,
  .messages-page__main--mobile-hidden {
    display: none;
  }
}
</style>
