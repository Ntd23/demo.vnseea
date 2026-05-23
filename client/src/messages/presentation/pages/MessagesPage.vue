<!-- Description: Renders the messages screen with the same left-list, center-thread, and right-info pane order as the PHP template. -->
<template>
  <div class="h-full min-h-0 w-full overflow-hidden bg-white">
    <div class="flex h-full min-h-0 overflow-hidden">
      <aside
        class="messages-page__left h-full min-h-0 shrink-0 border-r border-[#e5e7eb] bg-white"
        :class="{ 'messages-page__left--mobile-hidden': !mobileListOpen }"
      >
        <MessagesChatList
          v-model:active-tab="activeTab"
          v-model:query="query"
          v-model:multi-text="multiText"
          v-model:multi-file="multiFile"
          :multi-pending="isMultiSending"
          :status-message="multiFeedbackMessage"
          :status-tone="multiFeedbackTone"
          :all-visible-recipients-selected="allVisibleRecipientsSelected"
          :contacts="filteredContacts"
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
          @update:active-tag-filter="setActiveTagFilter"
          @open-chat="handleOpenChatFromMulti"
        />
      </aside>

      <main
        class="messages-page__main h-full min-h-0 min-w-0 flex-1 flex-col bg-white"
        :class="{ 'messages-page__main--mobile-hidden': mobileListOpen }"
      >
        <MessagesChatWindow
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

        <div v-if="infoPanelOpen && selectedContact" class="border-t border-[#e5e7eb] xl:hidden">
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

    <UModal v-model:open="tagModalOpen" title="Thẻ phân loại" :ui="{ content: 'sm:max-w-[640px]' }">
      <template #body>
        <div class="messages-tag-modal">
          <div class="messages-tag-modal__tabs">
            <button
              type="button"
              class="messages-tag-modal__tab"
              :class="{ 'messages-tag-modal__tab--active': tagModalTab === 'assign' }"
              @click="tagModalTab = 'assign'"
            >
              Gắn thẻ
            </button>
            <button
              type="button"
              class="messages-tag-modal__tab"
              :class="{ 'messages-tag-modal__tab--active': tagModalTab === 'manage' }"
              @click="tagModalTab = 'manage'"
            >
              Quản lý thẻ
            </button>
          </div>

          <section v-if="tagModalTab === 'assign'" class="messages-tag-modal__panel">
            <h3 class="messages-tag-modal__title">Danh sách thẻ của bạn</h3>
            <div class="messages-tag-modal__list">
              <div
                v-for="tag in messageTagLabels"
                :key="tag.id"
                class="messages-tag-modal__row"
              >
                <span class="messages-tag-modal__name">
                  <span class="messages-tag-modal__dot" :style="{ backgroundColor: tag.color }" />
                  {{ tag.name }}
                </span>
                <button
                  type="button"
                  class="messages-tag-modal__action"
                  :class="contactHasTag(tag.id) ? 'messages-tag-modal__action--danger' : 'messages-tag-modal__action--primary'"
                  :disabled="isUpdatingTags"
                  @click="toggleContactTag(tag.id)"
                >
                  {{ contactHasTag(tag.id) ? 'Gỡ' : 'Gắn' }}
                </button>
              </div>
              <p v-if="messageTagLabels.length === 0" class="messages-tag-modal__empty">
                Chưa có thẻ nào.
              </p>
            </div>
            <p class="messages-tag-modal__hint">
              Mẹo: nhấn “Gắn/Gỡ” để áp dụng cho đối tượng hiện tại.
            </p>
          </section>

          <section v-else class="messages-tag-modal__panel">
            <h3 class="messages-tag-modal__title">Quản lý danh sách thẻ</h3>
            <div class="messages-tag-modal__create">
              <UInput v-model="newTagName" placeholder="Tên thẻ mới" size="lg" />
              <input v-model="newTagColor" type="color" class="messages-tag-modal__color">
              <UButton
                size="lg"
                :loading="isUpdatingTags"
                :disabled="newTagName.trim().length === 0"
                @click="submitCreateTag"
              >
                Tạo
              </UButton>
            </div>

            <div class="messages-tag-modal__list">
              <div
                v-for="tag in messageTagLabels"
                :key="tag.id"
                class="messages-tag-modal__row"
              >
                <span class="messages-tag-modal__name">
                  <span class="messages-tag-modal__dot" :style="{ backgroundColor: tag.color }" />
                  {{ tag.name }}
                </span>
                <button
                  type="button"
                  class="messages-tag-modal__action messages-tag-modal__action--danger"
                  :disabled="isUpdatingTags"
                  @click="deleteTagLabel(tag.id)"
                >
                  Xóa
                </button>
              </div>
              <p v-if="messageTagLabels.length === 0" class="messages-tag-modal__empty">
                Chưa có thẻ nào.
              </p>
            </div>
          </section>

          <div class="messages-tag-modal__footer">
            <UButton color="neutral" variant="soft" size="lg" @click="tagModalOpen = false">
              Đóng
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import MessagesChatList from "../components/ChatList.vue"
import MessagesChatWindow from "../components/ChatWindow.vue"
import MessagesMessageSidePanel from "../components/MessageSidePanel.vue"
import { useMessagesInbox } from "../../application/composables/useMessagesInbox"
import type { MessageContact } from "../../domain/types/messages.types"

const { t } = useI18n()
const infoPanelOpen = ref(false)
const groupModalOpen = ref(false)
const tagModalOpen = ref(false)
const tagModalTab = ref<"assign" | "manage">("assign")
const tagModalContact = ref<MessageContact | null>(null)
const groupName = ref("")
const newTagName = ref("")
const newTagColor = ref("#3b82f6")
const mobileListOpen = ref(true)
const {
  activeTagFilter,
  activeTab,
  attachTag,
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
  messageTagLabels,
  multiFeedbackMessage,
  multiFeedbackTone,
  multiFile,
  multiText,
  query,
  selectedContact,
  selectedRecipientIds,
  selectedRecipients,
  createGroupChat,
  createTagLabel,
  deleteSelectedConversation,
  deleteTagLabel,
  detachTag,
  markAllAsRead,
  isUpdatingTags,
  selectContact,
  setActiveTagFilter,
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

const tagModalLiveContact = computed(() => {
  const userId = tagModalContact.value?.userId ?? 0

  return filteredContacts.value.find(contact => contact.userId === userId)
    ?? tagModalContact.value
})

watch(selectedContact, () => {
  infoPanelOpen.value = false
})

function openCreateGroupModal() {
  activeTab.value = "multi"
  mobileListOpen.value = true
  groupModalOpen.value = true
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

function openTagModal(contact: MessageContact) {
  tagModalContact.value = contact
  tagModalTab.value = "assign"
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

async function submitCreateTag() {
  const name = newTagName.value.trim()

  if (!name) {
    return
  }

  const created = await createTagLabel({
    name,
    color: newTagColor.value,
  })

  if (created) {
    newTagName.value = ""
    tagModalTab.value = "assign"
  }
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
  height: 100%;
  overflow: hidden;
}

.messages-page__main {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.messages-tag-modal {
  max-height: min(68vh, 560px);
  overflow-y: auto;
  padding: 4px 0 0;
}

.messages-tag-modal__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 3px solid #e5e7eb;
  margin: 0 0 20px;
}

.messages-tag-modal__tab {
  height: 44px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  border-bottom: 3px solid transparent;
  margin-bottom: -3px;
}

.messages-tag-modal__tab--active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.messages-tag-modal__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.messages-tag-modal__title {
  color: #1f2937;
  font-size: 16px;
  font-weight: 800;
}

.messages-tag-modal__list {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(15, 23, 42, 0.12);
}

.messages-tag-modal__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.messages-tag-modal__row:last-child {
  border-bottom: 0;
}

.messages-tag-modal__name {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #374151;
  font-size: 15px;
  font-weight: 600;
}

.messages-tag-modal__dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.messages-tag-modal__action {
  min-width: 82px;
  height: 36px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
}

.messages-tag-modal__action:disabled {
  opacity: 0.65;
}

.messages-tag-modal__action--primary {
  background: #3b82f6;
}

.messages-tag-modal__action--danger {
  background: #ef4444;
}

.messages-tag-modal__hint,
.messages-tag-modal__empty {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.messages-tag-modal__empty {
  padding: 18px 12px;
}

.messages-tag-modal__create {
  display: grid;
  grid-template-columns: 1fr 46px auto;
  gap: 8px;
  align-items: center;
}

.messages-tag-modal__color {
  width: 46px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.messages-tag-modal__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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
