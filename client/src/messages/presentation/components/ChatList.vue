<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
    <div class="shrink-0 border-b border-secondary-100/80 bg-white/90 px-5 py-5 sm:px-6">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <UInput
            id="chat-search"
            size="xl"
            icon="i-ph-magnifying-glass-duotone"
            :placeholder="$t('pages.messagesPage.searchPlaceholder')"
            :ui="{
              base: 'h-14 rounded-[20px] bg-secondary-50/75 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 font-semibold text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]',
              icon: { leading: { pointer: 'pointer-events-none', base: 'text-[var(--text-primary)]' } }
            }"
          >
            <template #trailing>
              <div class="flex items-center gap-1 px-2">
                <UKbd size="xs">⌘</UKbd>
                <UKbd size="xs">K</UKbd>
              </div>
            </template>
          </UInput>
        </div>
        <UButton
          size="xl"
          class="h-14 w-14 rounded-[20px] bg-gradient-to-br from-primary-500 via-primary-600 to-sky-600 text-white font-black shadow-[0_18px_32px_rgba(14,165,233,0.25)] transition-all hover:-translate-y-0.5 active:scale-95 justify-center"
          square
        >
          <Icon name="i-ph-user-plus-duotone" class="h-6 w-6" />
        </UButton>
      </div>

      <div class="mt-5 grid gap-2 sm:grid-cols-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex min-w-0 items-center justify-center gap-2 rounded-[18px] h-12 px-3 transition-all duration-300 border font-black text-[10px] uppercase tracking-[0.22em]"
          :class="activeTab === tab.id
            ? 'bg-primary-50 border-primary-100 text-secondary-900 shadow-[0_12px_28px_rgba(14,165,233,0.10)]'
            : 'bg-secondary-50/80 border-secondary-100/70 text-[var(--text-primary)] hover:bg-white hover:text-secondary-700 hover:border-secondary-200'"
          type="button"
          @click="activeTab = tab.id"
        >
          <Icon :name="activeTab === tab.id ? tab.icon : tab.icon.replace('-fill', '-duotone')" class="h-4 w-4" />
          <span class="truncate">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(242,247,255,0.98))] px-5 py-5 sm:px-6 space-y-6 scrollbar-hide">
      <div class="relative overflow-hidden rounded-[30px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,255,0.98))] p-5 shadow-[0_24px_52px_rgba(15,23,42,0.07)]">
        <div class="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary-200/80 to-transparent" />

        <div class="relative space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="space-y-2">
              <p class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">{{ $t('pages.messagesPage.composeTitle') }}</p>
              <div class="h-1.5 w-[86px] rounded-full bg-gradient-to-r from-primary-500 via-sky-500 to-primary-300" />
            </div>
            <span class="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--text-primary)] shadow-[0_10px_24px_rgba(14,165,233,0.08)]">
              <span class="h-2 w-2 rounded-full bg-primary-500" />
              {{ tabs.find(tab => tab.id === activeTab)?.label }}
            </span>
          </div>

          <div class="rounded-[24px] bg-[linear-gradient(180deg,rgba(240,247,255,0.92),rgba(255,255,255,0.98))] p-4 ring-1 ring-secondary-100/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <div class="space-y-4">
              <UFormGroup
                :label="$t('pages.messagesPage.sendTo')"
                label-class="mb-2 pl-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-primary)]"
              >
                <UInput
                  size="lg"
                  icon="i-ph-users-duotone"
                  :placeholder="$t('pages.messagesPage.recipientPlaceholder')"
                  :ui="{
                    base: 'h-[3.5rem] w-full rounded-[22px] bg-white/98 px-3 ring-1 ring-secondary-200/75 shadow-[0_8px_20px_rgba(148,163,184,0.06)] transition-all duration-300 text-sm font-semibold text-[var(--text-primary)] placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300/70 focus:shadow-[0_12px_28px_rgba(14,165,233,0.10)]',
                    icon: { leading: { pointer: 'pointer-events-none', base: 'text-[var(--text-primary)]' } }
                  }"
                />
              </UFormGroup>

              <UFormGroup
                :label="$t('pages.messagesPage.content')"
                label-class="mb-2 pl-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-primary)]"
              >
                <UTextarea
                  size="lg"
                  :rows="4"
                  :placeholder="$t('pages.messagesPage.messagePlaceholder')"
                  :ui="{
                    base: 'min-h-[152px] w-full resize-none rounded-[22px] bg-white/98 px-4 py-3 ring-1 ring-secondary-200/75 shadow-[0_8px_20px_rgba(148,163,184,0.06)] transition-all duration-300 text-sm font-medium leading-6 text-[var(--text-primary)] placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-300/70 focus:shadow-[0_12px_28px_rgba(14,165,233,0.10)]',
                  }"
                />
              </UFormGroup>
            </div>
          </div>

          <div class="rounded-[24px] bg-white/92 p-4 ring-1 ring-secondary-100/80 shadow-[0_18px_32px_rgba(148,163,184,0.08)]">
            <div class="space-y-4">
              <div class="flex items-center justify-between gap-3 rounded-[18px] bg-secondary-50/75 px-4 py-3 ring-1 ring-secondary-100/80">
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-primary)]">{{ $t('pages.messagesPage.label') }}</p>
                  <p class="mt-1 text-xs font-semibold text-[var(--text-primary)]">{{ $t('pages.messagesPage.selectAll') }}</p>
                </div>
                <UCheckbox
                  :ui="{
                    base: 'h-5 w-5 rounded-lg border-secondary-200 text-[var(--text-primary)] focus:ring-primary-500'
                  }"
                />
              </div>

              <USelectMenu
                size="lg"
                :placeholder="$t('pages.messagesPage.chooseTag')"
                :options="[$t('pages.messagesPage.important'), $t('pages.messagesPage.work')]"
                :ui="{
                  trigger: 'h-12 rounded-[18px] bg-secondary-50/75 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 px-1 text-sm font-semibold text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]',
                  icon: { base: 'text-[var(--text-primary)] h-5 w-5' }
                }"
              >
                <template #leading>
                  <Icon name="i-ph-tag-duotone" class="h-5 w-5 text-[var(--text-primary)]" />
                </template>
              </USelectMenu>

              <UButton
                size="xl"
                class="h-12 w-full justify-center rounded-[20px] bg-gradient-to-r from-primary-600 via-sky-500 to-primary-600 px-5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_30px_rgba(14,165,233,0.22)] transition-all hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
                @click="$emit('send')"
              >
                <template #leading>
                  <Icon name="i-ph-paper-plane-tilt-duotone" class="h-4 w-4" />
                </template>
                {{ $t('pages.messagesPage.sendMessage') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-[22px] bg-white/75 px-4 py-4 ring-1 ring-secondary-100/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div class="space-y-3">
            <div class="min-w-0 space-y-1.5">
              <p class="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--text-primary)]">{{ $t('pages.messagesPage.users') }}</p>
              <h3 class="text-[1.65rem] font-black leading-[1.05] text-[var(--text-primary)] tracking-tighter">{{ $t('pages.messagesPage.resultCount', { count: resultCount }) }}</h3>
            </div>
            <UButton
              icon="i-ph-faders-duotone"
              variant="soft"
              size="sm"
              class="h-10 w-full justify-center rounded-[16px] bg-secondary-100 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-primary)] shadow-none ring-1 ring-inset ring-secondary-200 transition-all hover:bg-primary-600 hover:text-white"
            >
              {{ $t('pages.messagesPage.filters') }}
            </UButton>
          </div>
        </div>

        <div class="space-y-3">
          <MessagesPresentationChatListItem
            v-for="user in users"
            :key="user.id"
            :name="user.name"
            :avatar-url="user.avatarUrl"
            :status="user.status"
            :is-online="user.isOnline"
            @click="$emit('select-user', user)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact, MessageTab, MessageTabKey } from "../../domain/types/message.types"
import MessagesPresentationChatListItem from "./ChatListItem.vue"

const activeTab = defineModel<MessageTabKey>("activeTab", { default: "group" })

defineProps<{
  tabs: MessageTab[]
  users: MessageContact[]
  resultCount: number
}>()

defineEmits<{
  "select-user": [user: MessageContact]
  send: []
}>()
</script>
