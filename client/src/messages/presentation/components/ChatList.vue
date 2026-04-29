<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
    <div class="space-y-4 border-b border-[#f1f5f9] pb-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {{ $t('pages.messagesPage.seoTitle') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
            {{ $t('pages.messagesPage.seoDescription') }}
          </p>
        </div>

        <UButton
          color="primary"
          variant="soft"
          class="rounded-xl"
          icon="i-ph-plus-circle-duotone"
        />
      </div>

      <div class="flex gap-2 overflow-x-auto pb-1">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          :color="activeTab === tab.id ? 'primary' : 'neutral'"
          :variant="activeTab === tab.id ? 'solid' : 'soft'"
          class="shrink-0 rounded-xl font-semibold"
          @click="emit('update:activeTab', tab.id)"
        >
          <Icon :name="tab.icon" class="mr-1.5 h-4 w-4" />
          {{ tab.label }}
        </UButton>
      </div>
    </div>

    <div class="scrollbar-hide mt-4 flex-1 space-y-3 overflow-y-auto">
      <MessagesChatListItem
        v-for="contact in contacts"
        :key="contact.id"
        :name="contact.name"
        :avatar-url="contact.avatarUrl"
        :status="contact.status"
        :is-online="contact.isOnline"
        @click="emit('select-user', contact)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact, MessageTab, MessageTabKey } from "../../domain/types/messages.types"
import MessagesChatListItem from "./ChatListItem.vue"

defineProps<{
  activeTab: MessageTabKey
  contacts: MessageContact[]
  tabs: MessageTab[]
}>()

const emit = defineEmits<{
  'select-user': [user: MessageContact]
  'update:activeTab': [tab: MessageTabKey]
}>()
</script>
