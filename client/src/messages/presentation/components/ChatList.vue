<!-- Description: Renders the left inbox pane with search, actions, tabs, and real conversation rows from the backend inbox. -->
<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden bg-white">
    <div class="border-b border-[#f1f5f9] px-6 py-6">
      <div class="flex items-center gap-5">
        <div class="flex h-16 min-w-0 flex-1 items-center gap-4 rounded-[14px] bg-[#f5f5f5] px-5">
          <Icon name="i-ph-magnifying-glass-duotone" class="h-6 w-6 text-[#8b8b8b]" />
          <input
            :value="query"
            type="text"
            class="w-full bg-transparent text-[18px] text-[var(--text-primary)] outline-none placeholder:text-[#9ca3af]"
            :placeholder="$t('pages.messagesPage.searchPlaceholder')"
            @input="emit('update:query', ($event.target as HTMLInputElement).value)"
          >
        </div>

        <div class="flex h-16 shrink-0 overflow-hidden rounded-[14px] bg-[var(--bg-brand)]">
          <button
            class="messages-list__top-action"
            type="button"
            :title="markAllLabel"
            @click="emit('mark-all-read')"
          >
            <Icon v-if="!markingRead" name="i-ph-list-checks-bold" class="h-6 w-6" />
            <Icon v-else name="i-ph-spinner-gap-bold" class="h-6 w-6 animate-spin" />
          </button>
          <button
            class="messages-list__top-action"
            type="button"
            :title="createGroupLabel"
            @click="emit('create-group')"
          >
            <Icon name="i-ph-user-plus-bold" class="h-6 w-6" />
          </button>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-3 gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="chat-list__tab"
          :class="{ 'chat-list__tab--active': activeTab === tab.id }"
          type="button"
          @click="emit('update:activeTab', tab.id)"
        >
          <Icon :name="tab.icon" class="h-4 w-4" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'multi'" class="border-b border-[#f1f5f9] bg-[#fafafa] px-6 py-4">
      <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {{ $t("pages.messagesPage.composeTitle") }}
      </p>
      <p class="mt-1 text-sm leading-6 text-slate-600">
        {{ multiDescription }}
      </p>
      <div class="mt-3 flex items-center justify-between gap-3">
        <p class="text-xs font-semibold text-slate-500">
          {{ selectedCountLabel }}
        </p>
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          class="rounded-full px-3 font-semibold"
          @click="emit('toggle-all-recipients')"
        >
          {{ selectAllActionLabel }}
        </UButton>
      </div>
      <div v-if="selectedRecipients.length > 0" class="mt-3 flex flex-wrap gap-2">
        <UBadge
          v-for="contact in selectedRecipients.slice(0, 4)"
          :key="contact.id"
          color="primary"
          variant="soft"
          class="rounded-full px-3 py-1 font-semibold"
        >
          {{ contact.name }}
        </UBadge>
        <UBadge
          v-if="selectedRecipients.length > 4"
          color="neutral"
          variant="soft"
          class="rounded-full px-3 py-1 font-semibold"
        >
          +{{ selectedRecipients.length - 4 }}
        </UBadge>
      </div>
      <p v-else class="mt-3 text-sm text-slate-500">
        {{ noRecipientsSelected }}
      </p>
      <UButton
        class="mt-4 w-full rounded-full font-semibold md:hidden"
        :disabled="selectedRecipients.length === 0"
        @click="emit('open-multi-composer')"
      >
        <template #leading>
          <Icon name="i-ph-paper-plane-tilt-bold" class="h-4 w-4" />
        </template>
        {{ $t("pages.messagesPage.openComposer") }}
      </UButton>
    </div>

    <div class="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-3">
      <p class="text-sm font-black text-[var(--text-primary)]">{{ resultLabel }}</p>
      <span v-if="pending" class="text-xs font-semibold text-slate-500">{{ loadingLabel }}</span>
      <span v-else class="text-xs font-semibold text-slate-500">{{ contacts.length }}</span>
    </div>

    <div class="scrollbar-hide flex-1 space-y-1 overflow-y-auto px-4 py-4">
      <MessagesChatListItem
        v-for="contact in contacts"
        :key="contact.id"
        :avatar-url="contact.avatarUrl"
        :is-active="isContactActive(contact)"
        :is-online="contact.isOnline"
        :name="contact.name"
        :preview="contact.preview"
        :show-select="activeTab === 'multi'"
        :status="getContactStatus(contact)"
        :time="contact.time"
        :unread-count="contact.unreadCount"
        @click="emit('select-user', contact)"
      />

      <div v-if="!pending && contacts.length === 0" class="rounded-[18px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-6 text-center text-sm text-slate-500">
        {{ emptyLabel }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact, MessageTab, MessageTabKey } from "../../domain/types/messages.types"
import MessagesChatListItem from "./ChatListItem.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  allVisibleRecipientsSelected?: boolean
  contacts: MessageContact[]
  pending?: boolean
  query: string
  selectedContactId?: string
  selectedRecipientIds?: number[]
  selectedRecipients?: MessageContact[]
  tabs: MessageTab[]
  markingRead?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  "select-user": [user: MessageContact]
  "create-group": []
  "mark-all-read": []
  "open-multi-composer": []
  "toggle-all-recipients": []
  "update:activeTab": [tab: MessageTabKey]
  "update:query": [value: string]
}>()

const markAllLabel = computed(() => t("pages.messagesPage.markAllRead"))
const createGroupLabel = computed(() => t("pages.messagesPage.newGroupChat"))
const multiDescription = computed(() => t("pages.messagesPage.multiTabDescription"))
const loadingLabel = computed(() => t("pages.messagesPage.loadingConversations"))

const selectedRecipients = computed(() => props.selectedRecipients ?? [])

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
    count: selectedRecipients.value.length,
  }),
)

const selectAllActionLabel = computed(() =>
  props.allVisibleRecipientsSelected
    ? t("pages.messagesPage.clearVisible")
    : t("pages.messagesPage.selectAll"),
)

const noRecipientsSelected = computed(() => t("pages.messagesPage.noRecipientsSelected"))

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
.chat-list__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 70px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  padding: 10px 12px;
  font-size: 18px;
  font-weight: 700;
  color: #8b8b8b;
  transition: all 0.2s ease;
}

.chat-list__tab--active {
  border-color: transparent;
  background: #d9d4ff;
  color: var(--text-brand);
}

.messages-list__top-action {
  display: inline-flex;
  width: 68px;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: background var(--duration-fast) var(--ease-default);
}

.messages-list__top-action:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
