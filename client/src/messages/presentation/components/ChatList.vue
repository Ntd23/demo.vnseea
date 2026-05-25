<!-- Description: Renders the left inbox pane with search, actions, tabs, inline multi-sender, and real conversation rows from the backend inbox. -->
<template>
  <div class="scrollbar-hide flex h-full flex-col overflow-y-auto bg-white">
    <!-- Header Block -->
    <div class="border-b border-[#f1f5f9] px-5 py-5 shrink-0">
      <div class="flex items-center gap-4">
        <!-- Search Input -->
        <div class="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[12px] bg-[#f6f6f6] px-4 transition duration-200 focus-within:bg-white focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.12)] focus-within:ring-1 focus-within:ring-black/5">
          <Icon name="i-ph-magnifying-glass-duotone" class="h-5 w-5 text-[#8e8e93]" />
          <input
            :value="query"
            type="text"
            class="w-full bg-transparent text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[#9ca3af]"
            :placeholder="$t('pages.messagesPage.searchPlaceholder')"
            @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <!-- Top Actions Wrapper -->
        <div class="messages-list__top-actions-wrapper">
          <button
            class="messages-list__top-action"
            type="button"
            :title="markAllLabel"
            @click="emit('mark-all-read')"
          >
            <Icon v-if="!markingRead" name="i-ph-list-checks-bold" class="messages-list__top-action-icon" />
            <Icon v-else name="i-ph-spinner-gap-bold" class="messages-list__top-action-icon animate-spin" />
          </button>
          <button
            class="messages-list__top-action"
            type="button"
            :title="createGroupLabel"
            @click="emit('create-group')"
          >
            <Icon name="i-ph-user-plus-bold" class="messages-list__top-action-icon" />
          </button>
        </div>
      </div>

      <!-- Tab Buttons in 1 Row (Parity with WoWonder Web) -->
      <div class="chat-list__tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="chat-list__tab"
          :class="{ 'chat-list__tab--active': activeTab === tab.id }"
          type="button"
          @click="emit('update:activeTab', tab.id)"
        >
          <div class="relative flex items-center justify-center">
            <Icon :name="tab.icon" class="chat-list__tab-icon" />
            <span
              v-if="tab.id === 'multi' && selectedRecipients.length > 0"
              class="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] font-bold text-white shadow-sm"
            >
              {{ selectedRecipients.length }}
            </span>
          </div>
          <span class="chat-list__tab-label">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- Inline Multi-Send Compose Controls (Strict Parity with WoWonder left panel form) -->
    <div v-if="activeTab === 'multi'" class="chat-list__multi-composer shrink-0">
      <!-- Title -->
      <div class="flex items-center justify-between mb-3.5">
        <h4 class="text-xs font-bold uppercase tracking-[0.08em] text-[#8e8e93] m-0">
          {{ $t("pages.messagesPage.composeTitle") }}
        </h4>
        <span class="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
          {{ selectedCountLabel }}
        </span>
      </div>

      <div class="mb-3">
        <label class="block text-xs font-bold text-[#8e8e93] mb-1.5 uppercase tracking-wide">
          {{ tagFilterLabel }}
        </label>
        <select
          class="chat-list__tag-filter"
          :value="activeTagFilter"
          @change="emit('update:activeTagFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ chooseTagLabel }}</option>
          <option value="0">{{ allTaggedUsersLabel }}</option>
          <option
            v-for="tag in messageTagLabels ?? []"
            :key="tag.id"
            :value="String(tag.id)"
          >
            {{ tag.name }}
          </option>
        </select>
        <p v-if="activeTagFilter" class="mt-1.5 text-[11px] font-semibold text-slate-500">
          {{ tagFilterStatus }}
        </p>
      </div>

      <!-- Selected Recipients Names (Chips Inline parity with WoWonder) -->
      <div class="mb-3">
        <label class="block text-xs font-bold text-[#8e8e93] mb-1.5 uppercase tracking-wide">
          {{ $t("pages.messagesPage.sendTo") || 'Gửi tới' }}:
        </label>
        <div class="text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg p-2.5 min-h-[32px] break-words leading-relaxed border border-slate-200">
          {{ selectedNamesList || $t("pages.messagesPage.noRecipientsSelected") || 'Chưa chọn người nhận nào.' }}
        </div>
      </div>

      <!-- Content Textarea -->
      <div class="mb-3">
        <label class="block text-xs font-bold text-[#8e8e93] mb-1.5 uppercase tracking-wide">
          {{ $t("pages.messagesPage.content") || 'Nội dung' }}
        </label>
        <textarea
          :value="multiText"
          @input="emit('update:multiText', ($event.target as HTMLTextAreaElement).value)"
          rows="3"
          class="chat-list__multi-textarea"
          placeholder="Nhập nội dung tin nhắn..."
        />
      </div>

      <!-- Attachment input (optional) -->
      <div class="mb-4">
        <label class="block text-xs font-bold text-[#8e8e93] mb-1.5 uppercase tracking-wide">
          {{ $t("pages.messagesPage.attachmentLabel") || 'Đính kèm (tùy chọn)' }}
        </label>
        <div class="flex items-center gap-2">
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            @change="onMultiFileChange"
          />
          <button
            type="button"
            class="chat-list__file-btn"
            @click="triggerFileInput"
          >
            <Icon name="i-ph-paperclip-bold" class="h-4 w-4" />
            <span>{{ multiFile ? changeFileLabel : chooseFileLabel }}</span>
          </button>
          <span v-if="multiFile" class="text-xs text-slate-600 truncate max-w-[130px] font-medium">
            {{ multiFile.name }}
          </span>
          <button
            v-if="multiFile"
            type="button"
            class="text-[#ef4444] hover:text-[#dc2626] p-1 flex items-center justify-center transition"
            @click="clearMultiFile"
          >
            <Icon name="i-ph-x-bold" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Checklist Controllers: Toggle all and Submit -->
      <div class="flex items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9]">
        <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            :checked="allVisibleRecipientsSelected"
            class="rounded border-slate-300 text-[#002aff] focus:ring-[#002aff] h-4 w-4 transition"
            @change="emit('toggle-all-recipients')"
          />
          <span>{{ $t("pages.messagesPage.selectAll") || 'Chọn tất cả' }}</span>
        </label>

        <button
          type="button"
          class="chat-list__multi-send-btn"
          :disabled="multiPending || !canSendMulti"
          @click="emit('send-multi')"
        >
          <Icon v-if="!multiPending" name="i-ph-paper-plane-tilt-bold" class="h-4 w-4" />
          <Icon v-else name="i-ph-spinner-gap-bold" class="h-4 w-4 animate-spin" />
          <span>{{ multiPending ? $t("pages.messagesPage.multiSendingButton") || 'Đang gửi...' : $t("pages.messagesPage.sendMessage") || 'Gửi tin nhắn' }}</span>
        </button>
      </div>

      <!-- Feedback Banner -->
      <div
        v-if="statusMessage"
        class="mt-3.5 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold"
        :class="statusClass"
      >
        {{ statusMessage }}
      </div>
    </div>

    <!-- Active Conversations / Results Title -->
    <div class="flex items-center justify-between border-b border-[#f1f5f9] px-5 py-3 shrink-0">
      <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#8e8e93]">{{ resultLabel }}</p>
      <span v-if="pending" class="text-xs font-semibold text-slate-400">{{ loadingLabel }}</span>
      <span v-else class="text-xs font-bold text-slate-500">{{ contacts.length }}</span>
    </div>

    <div class="scrollbar-hide overflow-y-auto space-y-1.5 px-3 py-3 bg-white shrink-0" style="max-height: 380px;">
      <MessagesChatListItem
        v-for="contact in contacts"
        :key="contact.id"
        :avatar-url="contact.avatarUrl"
        :is-active="isContactActive(contact)"
        :is-online="contact.isOnline"
        :name="contact.name"
        :preview="contact.preview"
        :show-select="activeTab === 'multi'"
        :show-tag-action="activeTab === 'user' && contact.type === 'user'"
        :status="getContactStatus(contact)"
        :tags="contact.tags ?? []"
        :time="contact.time"
        :unread-count="contact.unreadCount"
        @click="emit('select-user', contact)"
        @manage-tags="emit('manage-tags', contact)"
        @open-chat="emit('open-chat', contact)"
      />

      <div v-if="!pending && contacts.length === 0" class="rounded-[12px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-8 text-center text-sm text-slate-500">
        {{ emptyLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact, MessageTab, MessageTabKey, MessageUserTag } from "../../domain/types/messages.types"
import MessagesChatListItem from "./ChatListItem.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  activeTagFilter?: string
  allVisibleRecipientsSelected?: boolean
  contacts: MessageContact[]
  messageTagLabels?: MessageUserTag[]
  pending?: boolean
  query: string
  selectedContactId?: string
  selectedRecipientIds?: number[]
  selectedRecipients: MessageContact[]
  tabs: MessageTab[]
  markingRead?: boolean
  multiText: string
  multiFile: File | null
  multiPending?: boolean
  statusMessage?: string
  statusTone?: "neutral" | "success" | "warning" | "error"
}>()

const { t, te, locale } = useI18n()

const chooseFileLabel = computed(() => {
  const key = 'pages.messagesPage.chooseFile'
  const translated = t(key)
  if (translated && translated !== key) {
    return translated
  }
  return locale.value === 'en' ? 'Choose file...' : 'Chọn file...'
})

const changeFileLabel = computed(() => {
  const key = 'pages.messagesPage.changeFile'
  const translated = t(key)
  if (translated && translated !== key) {
    return translated
  }
  return locale.value === 'en' ? 'Change file' : 'Thay đổi file'
})

const emit = defineEmits<{
  "select-user": [user: MessageContact]
  "create-group": []
  "mark-all-read": []
  "manage-tags": [user: MessageContact]
  "toggle-all-recipients": []
  "update:activeTab": [tab: MessageTabKey]
  "update:activeTagFilter": [tagId: string]
  "update:query": [value: string]
  "update:multiText": [value: string]
  "update:multiFile": [value: File | null]
  "send-multi": []
  "open-chat": [user: MessageContact]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const markAllLabel = computed(() => t("pages.messagesPage.markAllRead"))
const createGroupLabel = computed(() => t("pages.messagesPage.newGroupChat"))
const loadingLabel = computed(() => t("pages.messagesPage.loadingConversations"))
const tagFilterLabel = computed(() => t("pages.messagesPage.label") || "Nhãn")
const chooseTagLabel = computed(() => t("pages.messagesPage.chooseTag") || "Chọn nhãn...")
const allTaggedUsersLabel = computed(() => locale.value === "en" ? "All tagged users" : "Tất cả người đã gắn thẻ")
const tagFilterStatus = computed(() => {
  if (!props.activeTagFilter) {
    return ""
  }

  const label = props.activeTagFilter === "0"
    ? allTaggedUsersLabel.value
    : props.messageTagLabels?.find(tag => String(tag.id) === props.activeTagFilter)?.name || chooseTagLabel.value

  return locale.value === "en"
    ? `Filtering by ${label}`
    : `Đang lọc theo ${label}`
})

const resultLabel = computed(() =>
  props.activeTab === "multi"
    ? t("pages.messagesPage.availableRecipients")
    : t("pages.messagesPage.visibleConversations"),
)

const emptyLabel = computed(() =>
  props.activeTab === "multi"
    ? t("pages.messagesPage.noRecipientsAvailable")
    : t("pages.messagesPage.noMatchingConversations"),
)

const selectedCountLabel = computed(() =>
  t("pages.messagesPage.selectedRecipientsCount", {
    count: props.selectedRecipients.length,
  }),
)

const selectedNamesList = computed(() => {
  return props.selectedRecipients.map(u => u.name).join(', ')
})

const canSendMulti = computed(() =>
  props.selectedRecipients.length > 0 &&
  (props.multiText.trim().length > 0 || Boolean(props.multiFile))
)

const statusClass = computed(() => {
  if (props.statusTone === "success") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-100"
  }
  if (props.statusTone === "warning") {
    return "bg-amber-50 text-amber-700 border border-amber-100"
  }
  if (props.statusTone === "error") {
    return "bg-rose-50 text-rose-700 border border-rose-100"
  }
  return "bg-slate-100 text-slate-700 border border-slate-200"
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onMultiFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  emit("update:multiFile", file)
}

function clearMultiFile() {
  emit("update:multiFile", null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ""
  }
}

function isContactActive(contact: MessageContact) {
  if (props.activeTab === "multi") {
    return Boolean(contact.userId && props.selectedRecipientIds?.includes(contact.userId))
  }

  return props.selectedContactId === contact.id
}

function getContactStatus(contact: MessageContact) {
  if (contact.type === "group" && contact.memberCount) {
    return t("pages.messagesPage.groupMembersStatus", {
      count: contact.memberCount,
    })
  }

  return contact.status || t("pages.messagesPage.activeRecently")
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-list__tabs-container {
  display: flex !important;
  flex-direction: row !important;
  align-items: stretch !important;
  justify-content: space-between !important;
  gap: 8px !important;
  margin-top: 20px !important;
  width: 100% !important;
}

.chat-list__tab {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  min-height: 62px !important;
  border-radius: 10px !important;
  background-color: transparent !important;
  border: none !important;
  padding: 6px 2px !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #8e8e93 !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  line-height: 1.2 !important;
  text-align: center !important;
}

.chat-list__tab-icon {
  width: 20px !important;
  height: 20px !important;
  color: #8e8e93 !important;
  transition: color 0.2s ease !important;
}

.chat-list__tab:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  color: #555555 !important;
}

.chat-list__tab:hover .chat-list__tab-icon {
  color: #555555 !important;
}

.chat-list__tab--active {
  background-color: #e8ecfb !important;
  color: #002aff !important;
}

.chat-list__tab--active .chat-list__tab-icon {
  color: #002aff !important;
}

.chat-list__tab-label {
  display: block !important;
  white-space: pre-line !important;
  word-break: break-word !important;
}

.messages-list__top-actions-wrapper {
  display: flex !important;
  height: 48px !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  border-radius: 12px !important;
  background-color: #002aff !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.messages-list__top-action {
  display: inline-flex !important;
  width: 48px !important;
  height: 48px !important;
  align-items: center !important;
  justify-content: center !important;
  color: #ffffff !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.messages-list__top-action:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

.messages-list__top-action-icon {
  width: 20px !important;
  height: 20px !important;
  color: #ffffff !important;
}

.chat-list__multi-composer {
  font-family: 'Roboto', sans-serif !important;
  background-color: #fafafa !important;
  border-bottom: 1px solid #f1f5f9 !important;
  padding: 16px 20px !important;
}

.chat-list__multi-textarea {
  width: 100% !important;
  resize: none !important;
  background-color: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 13px !important;
  color: #1e293b !important;
  outline: none !important;
  transition: all 0.2s ease !important;
}

.chat-list__multi-textarea:focus {
  border-color: #002aff !important;
  box-shadow: 0 0 0 2px rgba(0, 42, 255, 0.08) !important;
}

.chat-list__tag-filter {
  width: 100% !important;
  height: 38px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  color: #334155 !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  outline: none !important;
  padding: 0 10px !important;
}

.chat-list__tag-filter:focus {
  border-color: #002aff !important;
  box-shadow: 0 0 0 2px rgba(0, 42, 255, 0.08) !important;
}

.chat-list__file-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background-color: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: #475569 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.chat-list__file-btn:hover {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
}

.chat-list__multi-send-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  background-color: #002aff !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  font-family: 'Roboto', sans-serif !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

.chat-list__multi-send-btn:hover:not(:disabled) {
  background-color: #0022d1 !important;
}

.chat-list__multi-send-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}
</style>
