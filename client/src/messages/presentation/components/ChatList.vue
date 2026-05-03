<!-- Description: Renders the left inbox pane with search, actions, tabs, and real conversation rows from the backend inbox. -->
<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white">
    <div class="space-y-4 border-b border-[#e2e8f0] p-4">
      <div class="flex items-center gap-2 rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5">
        <Icon name="i-ph-magnifying-glass-duotone" class="h-4 w-4 text-slate-500" />
        <input
          :value="query"
          type="text"
          class="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
          :placeholder="$t('pages.messagesPage.searchPlaceholder')"
          @input="emit('update:query', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton variant="soft" color="primary" class="rounded-full px-4 font-semibold" disabled>
          <template #leading>
            <Icon name="i-ph-checks-duotone" class="h-4 w-4" />
          </template>
          {{ markAllLabel }}
        </UButton>
        <UButton
          variant="soft"
          color="neutral"
          class="rounded-full px-4 font-semibold"
          @click="emit('update:activeTab', 'multi')"
        >
          <template #leading>
            <Icon name="i-ph-users-three-duotone" class="h-4 w-4" />
          </template>
          {{ createGroupLabel }}
        </UButton>
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1">
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

    <div v-if="activeTab === 'multi'" class="border-b border-[#e2e8f0] bg-[#f8fafc] p-4">
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
    </div>

    <div class="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
      <p class="text-sm font-black text-[var(--text-primary)]">{{ resultLabel }}</p>
      <span v-if="pending" class="text-xs font-semibold text-slate-500">{{ loadingLabel }}</span>
      <span v-else class="text-xs font-semibold text-slate-500">{{ contacts.length }}</span>
    </div>

    <div class="scrollbar-hide flex-1 space-y-2 overflow-y-auto p-3">
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
}>()

const { t } = useI18n()

const emit = defineEmits<{
  "select-user": [user: MessageContact]
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
  gap: 8px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.68);
  transition: all 0.2s ease;
}

.chat-list__tab--active {
  border-color: rgba(37, 99, 235, 0.16);
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
}
</style>
