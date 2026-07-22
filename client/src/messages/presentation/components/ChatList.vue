<!-- Description: Renders the inbox sidebar with search, user/group tabs, and the multi-send panel for text, file, and recording drafts. -->
<template>
  <div class="flex h-full flex-col bg-white">

    <!-- ── Header: Search + Actions ─────────────────── -->
    <div class="shrink-0 px-4 pt-5 pb-3">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Icon name="i-ph-magnifying-glass" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            :value="query"
            type="search"
            class="cl-search text-black"
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
      <div ref="tabListRef" class="mt-4 flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="cl-tab"
          :class="activeTab === tab.id ? 'cl-tab--active' : ''"
          :data-message-tab="tab.id"
          @click="emit('update:activeTab', tab.id)"
        >
          <div class="relative">
            <span
              v-if="tab.id === 'multi' && selectedRecipients.length > 0"
              class="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white"
            >
              {{ selectedRecipients.length }}
            </span>
          </div>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- ── Multi-send composer panel ────────────────── -->
    <div v-if="activeTab === 'multi'" class="cl-multi-panel">

      <div ref="multiStackRef" class="cl-multi-stack">
        <section class="cl-compose-section">
          <h2 class="cl-section-title">{{ $t("pages.messagesPage.content") }}</h2>

          <div class="cl-recipient-heading">
            <label class="cl-field-label">{{ $t("pages.messagesPage.sendTo") }}:</label>
            <span v-if="selectedRecipients.length > 0" class="cl-selected-count">{{ selectedCountLabel }}</span>
          </div>
          <div class="cl-recipient-box" :class="{ 'cl-recipient-box--empty': selectedRecipients.length === 0 }">
            <UListbox
              v-if="selectedRecipients.length > 0"
              v-model="selectedRecipientIdModel"
              :items="selectedRecipientListboxItems"
              value-key="value"
              multiple
              selected-icon="i-ph-x-bold"
              class="cl-recipient-listbox"
            />
            <span v-else class="cl-recipient-empty text-black">{{ $t("pages.messagesPage.noRecipientsSelected") }}</span>
          </div>

          <UTextarea
            :model-value="multiText"
            :rows="5"
            :placeholder="$t('pages.messagesPage.messagePlaceholder')"
            class="w-full"
            :ui="{ base: 'min-h-28 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white shadow-none text-sm' }"
            @update:model-value="emit('update:multiText', String($event || ''))"
          />

          <div class="cl-attachment-field">
            <label class="cl-field-label">
              {{ $t("pages.messagesPage.attachmentLabel") }}
              <span>({{ $t("pages.messagesPage.attachmentOptional").toLocaleLowerCase() }})</span>
            </label>
            <div class="cl-upload-box">
              <UFileUpload
                v-model="multiFileModel"
                :multiple="false"
                layout="list"
                :label="$t('pages.messagesPage.chooseFile')"
                class="w-full"
              />
            </div>
          </div>

          <label class="cl-select-all">
            <input
              type="checkbox"
              :checked="allVisibleRecipientsSelected"
              class="h-4 w-4 rounded border-slate-300 text-black focus:ring-primary-500"
              @change="emit('toggle-all-recipients')"
            >
            <span>{{ $t("pages.messagesPage.selectAll") }}</span>
          </label>

          <UButton
            type="button"
            icon="i-ph-paper-plane-tilt-bold"
            block
            class="cl-send-button btn-primary"
            :loading="multiPending"
            :disabled="multiPending || !canSendMulti"
            @click="emit('send-multi')"
          >
            {{ multiPending ? $t("pages.messagesPage.multiSendingButton") : $t("pages.messagesPage.sendMessage") }}
          </UButton>

          <section class="cl-filter-card">
            <USelectMenu
              v-model="activeTagFilterModel"
              :items="tagFilterItems"
              value-key="value"
              :placeholder="chooseTagLabel"
              :search-input="{ placeholder: chooseTagLabel }"
              clear
              class="w-full"
              :ui="{
                base: 'w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white shadow-none',
              }"
            />

            <div v-if="activeTagFilter" class="cl-tag-filter-status">
              <div class="cl-avatar-stack" aria-hidden="true">
                <UAvatar
                  v-for="recipient in selectedAvatarRecipients"
                  :key="recipient.id"
                  :src="recipient.avatarUrl"
                  :alt="recipient.name"
                  size="xs"
                  class="cl-stacked-avatar"
                />
                <span v-if="selectedOverflowCount > 0" class="cl-stacked-more">
                  +{{ selectedOverflowCount }}
                </span>
              </div>
              <p>{{ tagFilterStatus }}</p>
            </div>
          </section>

          <p
            v-if="statusMessage"
            class="cl-send-status"
            :class="`cl-send-status--${statusTone || 'neutral'}`"
            role="status"
          >
            {{ statusMessage }}
          </p>
        </section>

        <UAlert
          v-if="permissionDenied || errorMessage"
          color="error"
          variant="subtle"
          icon="i-ph-warning-circle-duotone"
          :title="$t('pages.messagesPage.recordPermissionTitle')"
          :description="permissionDenied ? $t('pages.messagesPage.recordPermissionDenied') : errorMessage"
          class="rounded-[var(--radius-md)]"
        />

        <section class="cl-multi-users">
          <h2 class="cl-section-title">{{ $t("pages.messagesPage.users") }}</h2>

          <div class="cl-multi-user-list">
            <UListbox
              v-if="contacts.length > 0"
              v-model="selectedRecipientIdModel"
              :items="multiRecipientListboxItems"
              value-key="value"
              multiple
              class="cl-multi-user-listbox"
              :ui="{
                root: 'gap-2',
                item: 'min-h-16 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-muted)] px-3 py-2 data-[state=checked]:border-[var(--color-primary-300)] data-[state=checked]:bg-[var(--bg-surface-active)]',
                itemWrapper: 'min-w-0',
                itemLabel: 'truncate text-sm font-semibold text-[var(--text-primary)]',
                itemTrailing: 'ml-auto gap-2',
                itemTrailingIcon: 'hidden',
              }"
            >
              <template #item-leading="{ item }">
                <span class="cl-multi-user-avatar">
                  <UAvatar :src="item.avatarUrl" :alt="item.label" size="sm" />
                  <span v-if="item.online" class="cl-multi-user-online" />
                </span>
              </template>

              <template #item-trailing="{ item }">
                <span class="cl-multi-select-state" aria-hidden="true">
                  <span class="cl-multi-checkbox" :class="{ 'cl-multi-checkbox--checked': isRecipientSelected(item.value) }">
                    <Icon v-if="isRecipientSelected(item.value)" name="i-ph-check-bold" class="h-3 w-3" />
                  </span>
                  <span>{{ $t("pages.messagesPage.selectRecipient") }}</span>
                </span>
                <UButton
                  type="button"
                  size="xs"
                  class="cl-multi-open-chat btn-primary"
                  @pointerdown.stop
                  @click.stop="emit('open-chat', item.contact)"
                >
                  {{ $t("pages.messagesPage.openChat") }}
                </UButton>
              </template>
            </UListbox>

            <div v-if="pending && contacts.length === 0" class="space-y-2" aria-hidden="true">
              <div v-for="i in 4" :key="i" class="cl-multi-user-skeleton">
                <USkeleton class="h-10 w-10 shrink-0 rounded-full" />
                <USkeleton class="h-3 w-28" />
                <USkeleton class="ml-auto h-8 w-20 rounded-[var(--radius-sm)]" />
              </div>
            </div>

            <div v-else-if="contacts.length === 0" class="cl-multi-empty">
              <Icon name="i-ph-users-three-duotone" class="h-7 w-7" />
              <span>{{ emptyLabel }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ── Contact list ──────────────────────────── -->
    <div v-if="activeTab !== 'multi'" class="cl-scroll-list min-h-0 flex-1 px-3 pb-3">
      <div class="space-y-0.5">
        <MessagesChatListItem
          v-for="contact in contacts"
          :key="contact.id"
          :avatar-url="contact.avatarUrl"
          :is-active="isContactActive(contact)"
          :is-typing="activeTab !== 'multi' && isContactTyping(contact)"
          :is-online="isContactOnline(contact)"
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

        <div v-if="pending && contacts.length === 0" class="space-y-0.5" aria-hidden="true">
          <div
            v-for="i in skeletonRowCount"
            :key="i"
            class="cl-skeleton-item"
            :class="{ 'cl-skeleton-item--active': i === 1 }"
          >
            <div class="cl-skeleton-avatar">
              <USkeleton class="cl-skeleton-avatar-shape" />
              <span v-if="activeTab !== 'group' && i === 1" class="cl-skeleton-online-dot" />
            </div>
            <div class="cl-skeleton-body">
              <div class="cl-skeleton-row cl-skeleton-row--top">
                <USkeleton class="cl-skeleton-name" :class="{ 'cl-skeleton-name--wide': i % 3 === 0 }" />
                <USkeleton class="cl-skeleton-time" />
              </div>
              <USkeleton class="cl-skeleton-status" :class="{ 'cl-skeleton-status--group': activeTab === 'group' }" />
              <div class="cl-skeleton-row cl-skeleton-row--bottom">
                <USkeleton class="cl-skeleton-preview" :class="{ 'cl-skeleton-preview--wide': i % 2 === 0 }" />
              </div>
              <div class="cl-skeleton-tags-row">
                <USkeleton class="cl-skeleton-tag" />
                <USkeleton v-if="activeTab === 'user' && i === 3" class="cl-skeleton-color-tag" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="contacts.length === 0"
          class="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--bg-muted)] px-4 py-10 text-center"
        >
          <Icon name="i-ph-chat-circle-dashed-duotone" class="h-8 w-8 text-[var(--text-tertiary)]" />
          <span class="text-sm text-[var(--text-secondary)]">{{ emptyLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UListbox from "@nuxt/ui/components/Listbox.vue"
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { useMessageRecorder } from "../../application/composables/useMessageRecorder"
import type { MessageContact, MessageRecordDraft, MessageTab, MessageTabKey, MessageUserTag } from "../../domain/types/messages.types"
import MessagesChatListItem from "./ChatListItem.vue"

const multiRecordModel = defineModel<MessageRecordDraft | null>("multiRecord", { default: null })
const tabListRef = ref<HTMLElement | null>(null)
const multiStackRef = ref<HTMLElement | null>(null)
let multiPanelResetFrame: number | null = null

const props = defineProps<{
  activeTab: MessageTabKey
  activeTagFilter?: string
  allVisibleRecipientsSelected?: boolean
  contacts: MessageContact[]
  isContactOnline?: (contact: MessageContact) => boolean
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
  "update:selectedRecipientIds": [userIds: number[]]
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
watch(() => props.activeTab, async (activeTab) => {
  if (activeTab !== "multi" || !import.meta.client) return

  // Reka Listbox highlights its first/selected item on mount with scrollIntoView().
  // Restore the tab focus and panel position after both listboxes finish mounting.
  await nextTick()
  await nextTick()

  if (multiPanelResetFrame !== null) {
    window.cancelAnimationFrame(multiPanelResetFrame)
  }

  multiPanelResetFrame = window.requestAnimationFrame(() => {
    multiStackRef.value?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    tabListRef.value
      ?.querySelector<HTMLElement>('[data-message-tab="multi"]')
      ?.focus({ preventScroll: true })
    multiPanelResetFrame = null
  })
})

onBeforeUnmount(() => {
  if (multiPanelResetFrame !== null) {
    window.cancelAnimationFrame(multiPanelResetFrame)
  }
})

const markAllLabel = computed(() => t("pages.messagesPage.markAllRead"))
const createGroupLabel = computed(() => t("pages.messagesPage.newGroupChat"))
const loadingLabel = computed(() => t("pages.messagesPage.loadingConversations"))
const skeletonRowCount = computed(() => props.activeTab === "group" ? 5 : 7)
const tagFilterLabel = computed(() => t("pages.messagesPage.label"))
const chooseTagLabel = computed(() => t("pages.messagesPage.chooseTag"))
const allTaggedUsersLabel = computed(() => t("pages.messagesPage.allTaggedUsers"))
const tagFilterItems = computed(() => [
  {
    label: allTaggedUsersLabel.value,
    value: "0",
    icon: "i-ph-users-three-duotone",
  },
  ...(props.messageTagLabels ?? []).map(tag => ({
    label: tag.name,
    value: String(tag.id),
    icon: "i-ph-tag-duotone",
  })),
])
const activeTagFilterModel = computed<string | null>({
  get: () => props.activeTagFilter || null,
  set: tagId => emit("update:activeTagFilter", tagId ?? ""),
})
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
const selectedAvatarRecipients = computed(() => props.selectedRecipients.slice(0, 5))
const selectedOverflowCount = computed(() => Math.max(props.selectedRecipients.length - selectedAvatarRecipients.value.length, 0))
const selectedRecipientListboxItems = computed(() => props.selectedRecipients.map(recipient => ({
  label: recipient.name,
  description: getContactStatus(recipient),
  value: recipient.userId ?? 0,
  avatar: {
    src: recipient.avatarUrl,
    alt: recipient.name,
  },
})))
const multiRecipientListboxItems = computed(() => props.contacts
  .filter(contact => (contact.userId ?? 0) > 0)
  .map(contact => ({
    label: contact.name,
    value: contact.userId ?? 0,
    avatarUrl: contact.avatarUrl,
    online: isContactOnline(contact),
    contact,
  })))
const selectedRecipientIdModel = computed<number[]>({
  get: () => props.selectedRecipientIds ?? [],
  set: userIds => emit("update:selectedRecipientIds", userIds),
})
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
function isContactActive(contact: MessageContact) {
  if (props.activeTab === "multi")
    return Boolean(contact.userId && props.selectedRecipientIds?.includes(contact.userId))
  return props.selectedContactId === contact.id
}

function isContactOnline(contact: MessageContact) {
  return props.isContactOnline?.(contact) ?? contact.isOnline
}

function isRecipientSelected(userId: number) {
  return props.selectedRecipientIds?.includes(userId) ?? false
}

function getContactStatus(contact: MessageContact) {
  if (contact.type === "group" && contact.memberCount)
    return t("pages.messagesPage.groupMembersStatus", { count: contact.memberCount })
  if (contact.type === "user" && isContactOnline(contact))
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
.cl-search::placeholder { color: var(--text-secondary); }

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

.cl-multi-panel {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  background: var(--bg-surface);
  padding: 0 16px;
}

.cl-selected-count {
  display: inline-flex;
  min-height: 24px;
  flex-shrink: 0;
  align-items: center;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: #ffffff;
  padding: 3px 9px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.cl-multi-stack {
  display: grid;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px 2px 20px 0;
  padding-right: 2px;
  scrollbar-width: thin;
}

.cl-multi-stack::-webkit-scrollbar {
  width: 6px;
}

.cl-multi-stack::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.cl-filter-card,
.cl-recipient-box,
.cl-upload-box {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: #ffffff;
}

.cl-filter-card {
  padding: 0;
  border: 0;
}

.cl-compose-section {
  display: grid;
  gap: 10px;
}

.cl-section-title {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-body);
  font-weight: var(--weight-bold);
  line-height: 1.35;
}

.cl-field-label {
  display: block;
  color: black;
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
}

.cl-field-label span {
  color: black;
  font-weight: var(--weight-medium);
}

.cl-recipient-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cl-select-all {
  display: inline-flex;
  width: fit-content;
  cursor: pointer;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
}

.cl-tag-filter-status {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.35;
}

.cl-tag-filter-status p {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cl-avatar-stack {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding-left: 6px;
}

.cl-stacked-avatar,
.cl-stacked-more {
  margin-left: -6px;
  box-shadow: 0 0 0 2px #ffffff;
}

.cl-stacked-more {
  display: inline-flex;
  min-width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eef2ff;
  color: var(--color-primary-600);
  font-size: 10px;
  font-weight: 800;
}

.cl-recipient-box {
  min-height: 44px;
  padding: 8px;
}

.cl-recipient-box--empty {
  display: flex;
  align-items: center;
  border-style: dashed;
  background: #fafbfe;
  padding: 11px 12px;
}

.cl-recipient-listbox {
  width: 100%;
  max-height: 104px;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.cl-recipient-empty {
  font-size: 13px;
}

.cl-attachment-field {
  display: grid;
  gap: 7px;
  margin-top: 2px;
}

.cl-upload-box {
  min-height: 44px;
  overflow: hidden;
  padding: 4px;
}

.cl-send-button {
  width: 100%;
  min-height: 40px;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.cl-send-status {
  margin: -2px 0 0;
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: 1.45;
}

.cl-send-status--success { color: var(--color-success-600, #16a34a); }
.cl-send-status--warning { color: var(--color-warning-700, #a16207); }
.cl-send-status--error { color: var(--color-error-600, #dc2626); }
.cl-send-status--neutral { color: var(--text-secondary); }

.cl-multi-users {
  display: grid;
  gap: 10px;
  border-top: 1px solid var(--border-light);
  padding-top: 16px;
}

.cl-multi-user-list {
  display: grid;
  gap: 8px;
}

.cl-multi-user-listbox {
  width: 100%;
}

.cl-multi-user-avatar {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.cl-multi-user-online {
  position: absolute;
  right: -1px;
  bottom: 1px;
  width: 9px;
  height: 9px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: var(--color-success-500, #22c55e);
}

.cl-multi-select-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: var(--text-caption);
  white-space: nowrap;
}

.cl-multi-checkbox {
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: 4px;
  background: #ffffff;
  color: #ffffff;
}

.cl-multi-checkbox--checked {
  border-color: var(--color-primary-500);
  background: var(--color-primary-500);
}

.cl-multi-open-chat {
  flex: 0 0 auto;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.cl-multi-user-skeleton {
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  padding: 10px;
}

.cl-multi-empty {
  display: flex;
  min-height: 96px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-caption);
  text-align: center;
}

.cl-scroll-list {
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.cl-scroll-list::-webkit-scrollbar {
  width: 6px;
}

.cl-scroll-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.cl-skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  min-height: 92px;
}

.cl-skeleton-item--active {
  border-color: #dbe3ff;
  background: #f6f8ff;
}

.cl-skeleton-avatar {
  position: relative;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
}

.cl-skeleton-avatar-shape {
  width: 44px !important;
  height: 44px !important;
  border-radius: 999px !important;
  background: #e8edf4 !important;
}

.cl-skeleton-online-dot {
  position: absolute;
  right: 0;
  bottom: 2px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: #3b82c4;
}

.cl-skeleton-body {
  min-width: 0;
  flex: 1;
  padding-top: 1px;
}

.cl-skeleton-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.cl-skeleton-row--bottom {
  margin-top: 7px;
  align-items: center;
}

.cl-skeleton-name {
  width: 96px;
  height: 19px;
  border-radius: 999px;
  background: #dfe5ee !important;
}

.cl-skeleton-name--wide {
  width: 118px;
}

.cl-skeleton-time {
  width: 46px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #e8edf4 !important;
}

.cl-skeleton-status {
  width: 112px;
  height: 14px;
  margin-top: 7px;
  border-radius: 999px;
  background: #e8edf4 !important;
}

.cl-skeleton-status--group {
  width: 92px;
}

.cl-skeleton-preview {
  width: 170px;
  height: 17px;
  border-radius: 999px;
  background: #e8edf4 !important;
}

.cl-skeleton-preview--wide {
  width: 220px;
}

.cl-skeleton-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
}

.cl-skeleton-tag {
  width: 28px;
  height: 20px;
  border-radius: 999px;
  background: #e8edf4 !important;
}

.cl-skeleton-color-tag {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: #fde68a !important;
}
</style>
