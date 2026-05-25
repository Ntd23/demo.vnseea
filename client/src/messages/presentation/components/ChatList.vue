<!-- Description: Renders the inbox sidebar with search, user/group tabs, and the multi-send panel for text, file, and recording drafts. -->
<template>
  <div class="flex h-full flex-col bg-white">

    <!-- ── Header: Search + Actions ─────────────────── -->
    <div class="shrink-0 px-4 pt-5 pb-3">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Icon name="i-ph-magnifying-glass" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            :value="query"
            type="search"
            class="cl-search"
            :placeholder="$t('pages.messagesPage.searchPlaceholder')"
            @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <UTooltip :text="markAllLabel">
          <button class="cl-icon-btn" type="button" :disabled="markingRead" @click="emit('mark-all-read')">
            <Icon v-if="!markingRead" name="i-ph-list-checks-bold" class="h-4.5 w-4.5" />
            <Icon v-else name="i-ph-spinner-gap-bold" class="h-4.5 w-4.5 animate-spin" />
          </button>
        </UTooltip>

        <UTooltip :text="createGroupLabel">
          <button class="cl-icon-btn cl-icon-btn--primary" type="button" @click="emit('create-group')">
            <Icon name="i-ph-pencil-simple-bold" class="h-4.5 w-4.5" />
          </button>
        </UTooltip>
      </div>

      <!-- ── Tabs ──────────────────────────────────── -->
      <div class="mt-4 flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="cl-tab"
          :class="activeTab === tab.id ? 'cl-tab--active' : ''"
          @click="emit('update:activeTab', tab.id)"
        >
          <div class="relative">
            <Icon :name="tab.icon" class="h-4 w-4" />
            <span
              v-if="tab.id === 'multi' && selectedRecipients.length > 0"
              class="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white"
            >
              {{ selectedRecipients.length }}
            </span>
          </div>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- ── Multi-send composer panel ────────────────── -->
    <div v-if="activeTab === 'multi'" class="shrink-0 border-b border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-4">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-label-secondary">{{ $t("pages.messagesPage.composeTitle") }}</span>
        <span class="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)] shadow-sm">
          {{ selectedCountLabel }}
        </span>
      </div>

      <div class="space-y-3">
        <div>
          <label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {{ tagFilterLabel }}
          </label>
          <select
            class="cl-select"
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
          <p v-if="activeTagFilter" class="mt-1.5 text-[11px] text-[var(--text-tertiary)]">
            {{ tagFilterStatus }}
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {{ $t("pages.messagesPage.sendTo") }}
          </label>
          <div class="min-h-[40px] rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white px-3 py-2.5 text-[var(--text-body)] text-sm text-[var(--text-primary)]">
            <span v-if="selectedNamesList" class="font-medium">{{ selectedNamesList }}</span>
            <span v-else class="text-[var(--text-tertiary)]">{{ $t("pages.messagesPage.noRecipientsSelected") }}</span>
          </div>
        </div>

        <UTextarea
          :model-value="multiText"
          autoresize
          :rows="3"
          :placeholder="$t('pages.messagesPage.messagePlaceholder')"
          :ui="{ base: 'rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white shadow-none text-sm' }"
          @update:model-value="emit('update:multiText', String($event || ''))"
        />

        <div class="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white p-3">
          <UFileUpload
            v-model="multiFileModel"
            :multiple="false"
            layout="list"
            highlight
            :label="$t('pages.messagesPage.chooseFile')"
            :description="$t('pages.messagesPage.attachmentOptional')"
            class="w-full"
          />
        </div>

        <div v-if="activeRecordDraft || isRecording" class="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="h-2 w-2 rounded-full" :class="isRecording ? 'animate-pulse bg-rose-500' : 'bg-[var(--color-primary-500)]'" />
              <div>
                <p class="text-sm font-semibold text-[var(--text-primary)]">
                  {{ isRecording ? $t('pages.messagesPage.recordingInProgress') : $t('pages.messagesPage.recordReady') }}
                </p>
                <p class="text-xs text-[var(--text-tertiary)]">{{ formattedRecordDuration }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UButton v-if="isRecording" type="button" color="warning" variant="soft" icon="i-ph-stop-circle-duotone" class="rounded-full" size="sm" @click="stopRecordingDraft">
                {{ $t("pages.messagesPage.stopRecording") }}
              </UButton>
              <UButton v-else-if="activeRecordDraft" type="button" color="neutral" variant="soft" icon="i-ph-trash-duotone" class="rounded-full" size="sm" @click="discardRecording">
                {{ $t("pages.messagesPage.discardRecording") }}
              </UButton>
            </div>
          </div>
          <audio v-if="activeRecordDraft" :src="activeRecordDraft.previewUrl" class="mt-3 w-full" controls preload="none" />
        </div>

        <UAlert
          v-if="permissionDenied || errorMessage"
          color="error"
          variant="subtle"
          icon="i-ph-warning-circle-duotone"
          :title="$t('pages.messagesPage.recordPermissionTitle')"
          :description="permissionDenied ? $t('pages.messagesPage.recordPermissionDenied') : errorMessage"
          class="rounded-[var(--radius-md)]"
        />

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-light)] pt-3">
          <label class="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
            <input
              type="checkbox"
              :checked="allVisibleRecipientsSelected"
              class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              @change="emit('toggle-all-recipients')"
            >
            <span>{{ $t("pages.messagesPage.selectAll") }}</span>
          </label>
          <div class="flex items-center gap-2">
            <UTooltip :text="isRecording ? $t('pages.messagesPage.stopRecording') : $t('pages.messagesPage.startRecording')">
              <UButton
                type="button"
                color="neutral"
                :variant="isRecording ? 'solid' : 'soft'"
                :icon="isRecording ? 'i-ph-stop-circle-duotone' : 'i-ph-microphone-duotone'"
                class="rounded-full"
                size="sm"
                :disabled="multiPending || !isSupported"
                @click="handleRecordButton"
              />
            </UTooltip>
            <UButton
              type="button"
              color="primary"
              icon="i-ph-paper-plane-tilt-bold"
              class="rounded-full px-4"
              size="sm"
              :loading="multiPending"
              :disabled="multiPending || !canSendMulti"
              @click="emit('send-multi')"
            >
              {{ multiPending ? $t("pages.messagesPage.multiSendingButton") : $t("pages.messagesPage.sendMessage") }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="statusMessage"
          :color="statusColor"
          variant="subtle"
          :description="statusMessage"
          class="rounded-[var(--radius-md)]"
        />
      </div>
    </div>

    <!-- ── Contacts header ───────────────────────── -->
    <div class="flex items-center justify-between px-4 py-2.5">
      <span class="text-[11px] font-bold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">{{ resultLabel }}</span>
      <span class="text-[11px] font-semibold text-[var(--text-tertiary)]">
        <span v-if="pending" class="animate-pulse">{{ loadingLabel }}</span>
        <span v-else>{{ contacts.length }}</span>
      </span>
    </div>

    <!-- ── Contact list ──────────────────────────── -->
    <UScrollArea class="min-h-0 flex-1 px-3 pb-3">
      <div class="space-y-0.5">
        <MessagesChatListItem
          v-for="contact in contacts"
          :key="contact.id"
          :avatar-url="contact.avatarUrl"
          :is-active="isContactActive(contact)"
          :is-typing="activeTab === 'user' && isContactTyping(contact)"
          :is-online="contact.isOnline"
          :name="contact.name"
          :preview="contact.preview"
          :show-select="activeTab === 'multi'"
          :show-tag-action="activeTab === 'user' && contact.type === 'user'"
          :status="getContactStatus(contact)"
          :tags="contact.tags ?? []"
          :time="contact.time"
          :type="contact.type"
          :unread-count="contact.unreadCount"
          @click="emit('select-user', contact)"
          @manage-tags="emit('manage-tags', contact)"
          @open-chat="emit('open-chat', contact)"
        />

        <div v-if="pending" class="space-y-1.5 px-1 pt-1">
          <USkeleton v-for="i in 4" :key="i" class="h-[68px] rounded-[var(--radius-md)]" />
        </div>

        <div
          v-else-if="contacts.length === 0"
          class="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-10 text-center"
        >
          <Icon name="i-ph-chat-circle-dashed-duotone" class="h-8 w-8 text-[var(--text-tertiary)]" />
          <span class="text-sm text-[var(--text-secondary)]">{{ emptyLabel }}</span>
        </div>
      </div>
    </UScrollArea>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"
import { useMessageRecorder } from "../../application/composables/useMessageRecorder"
import type { MessageContact, MessageRecordDraft, MessageTab, MessageTabKey, MessageUserTag } from "../../domain/types/messages.types"
import MessagesChatListItem from "./ChatListItem.vue"

const multiRecordModel = defineModel<MessageRecordDraft | null>("multiRecord", { default: null })

const props = defineProps<{
  activeTab: MessageTabKey
  activeTagFilter?: string
  allVisibleRecipientsSelected?: boolean
  contacts: MessageContact[]
  isContactTyping: (contact: MessageContact) => boolean
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

const { t } = useI18n()
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

const {
  isSupported, isRecording, permissionDenied, errorMessage,
  durationMs, recordDraft, startRecording, stopRecording, clearRecording,
} = useMessageRecorder()

const multiFileModel = computed<File | null>({
  get: () => props.multiFile,
  set: (file) => { emit("update:multiFile", file ?? null) },
})

watch(recordDraft, (draft) => { multiRecordModel.value = draft })
watch(() => props.multiFile, (file) => { if (file && recordDraft.value) clearRecording() })
watch(() => multiRecordModel.value, (draft) => {
  if (!draft && recordDraft.value && !isRecording.value) clearRecording()
})

const markAllLabel = computed(() => t("pages.messagesPage.markAllRead"))
const createGroupLabel = computed(() => t("pages.messagesPage.newGroupChat"))
const loadingLabel = computed(() => t("pages.messagesPage.loadingConversations"))
const tagFilterLabel = computed(() => t("pages.messagesPage.label"))
const chooseTagLabel = computed(() => t("pages.messagesPage.chooseTag"))
const allTaggedUsersLabel = computed(() => t("pages.messagesPage.allTaggedUsers"))
const activeRecordDraft = computed(() => multiRecordModel.value || recordDraft.value)
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
  t("pages.messagesPage.selectedRecipientsCount", { count: props.selectedRecipients.length }),
)
const selectedNamesList = computed(() =>
  props.selectedRecipients.map(c => c.name).join(", "),
)
const tagFilterStatus = computed(() => {
  if (!props.activeTagFilter) return ""
  const label = props.activeTagFilter === "0"
    ? allTaggedUsersLabel.value
    : props.messageTagLabels?.find(tag => String(tag.id) === props.activeTagFilter)?.name || chooseTagLabel.value
  return t("pages.messagesPage.filteringBy", { label })
})
const canSendMulti = computed(() =>
  props.selectedRecipients.length > 0
  && (props.multiText.trim().length > 0 || Boolean(props.multiFile) || Boolean(activeRecordDraft.value)),
)
const formattedRecordDuration = computed(() => {
  const src = isRecording.value ? durationMs.value : (activeRecordDraft.value?.durationMs ?? durationMs.value)
  const total = Math.max(Math.floor(src / 1000), 0)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
})
const statusColor = computed(() => {
  if (props.statusTone === "success") return "success"
  if (props.statusTone === "warning") return "warning"
  if (props.statusTone === "error") return "error"
  return "neutral"
})

function isContactActive(contact: MessageContact) {
  if (props.activeTab === "multi")
    return Boolean(contact.userId && props.selectedRecipientIds?.includes(contact.userId))
  return props.selectedContactId === contact.id
}

function getContactStatus(contact: MessageContact) {
  if (contact.type === "group" && contact.memberCount)
    return t("pages.messagesPage.groupMembersStatus", { count: contact.memberCount })
  if (contact.type === "user" && contact.isOnline)
    return t("pages.messagesPage.activeNow")
  return contact.status || t("pages.messagesPage.activeRecently")
}

async function handleRecordButton() {
  if (isRecording.value) { await stopRecordingDraft(); return }
  emit("update:multiFile", null)
  await startRecording()
}

async function stopRecordingDraft() { await stopRecording() }
function discardRecording() { clearRecording(); multiRecordModel.value = null }
</script>

<style scoped>
/* Search input */
.cl-search {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
  font-size: var(--text-body);
  font-family: var(--font-primary);
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-fast) var(--ease-default);
}
.cl-search:focus {
  border-color: var(--border-strong);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px rgba(0, 0, 255, 0.06);
}
.cl-search::placeholder { color: var(--text-tertiary); }

/* Icon buttons */
.cl-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  flex-shrink: 0;
}
.cl-icon-btn:hover { background: var(--bg-surface-hover); color: var(--text-primary); border-color: var(--border-default); }
.cl-icon-btn:disabled { opacity: 0.5; cursor: default; }

.cl-icon-btn--primary {
  background: var(--bg-brand);
  color: #ffffff;
  border-color: transparent;
}
.cl-icon-btn--primary:hover { background: var(--bg-brand-hover); color: #ffffff; }

/* Tab pills */
.cl-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  font-family: var(--font-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  white-space: nowrap;
}
.cl-tab:hover:not(.cl-tab--active) {
  background: rgba(255,255,255,0.6);
  color: var(--text-primary);
}
.cl-tab--active {
  background: var(--bg-surface);
  color: var(--color-primary-600);
  font-weight: var(--weight-semibold);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--border-light);
}

/* Select */
.cl-select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: var(--text-body);
  font-family: var(--font-primary);
  outline: none;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}
.cl-select:focus { border-color: var(--border-strong); }
</style>
