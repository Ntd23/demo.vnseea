<!-- Description: Renders the desktop and mobile user conversation detail panel with profile and delete actions, aligned to the PHP user chat shell. -->
<template>
  <div class="user-detail-panel flex h-full w-full flex-col overflow-y-auto bg-[#eef0f4]">
    <template v-if="contact">
      <!-- Top Header -->
      <div class="user-detail-panel__top sticky top-0 z-10 flex min-h-[60px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-3">
        <h2 class="text-base font-bold text-[#0f172a]">
          {{ $t("pages.messagesPage.info") || "Thông tin hội thoại" }}
        </h2>
      </div>

      <div class="flex flex-1 flex-col gap-3 p-3">
        <!-- Hero Card -->
        <section class="user-detail-panel__hero flex flex-col items-center rounded-2xl bg-white px-5 py-6 text-center shadow-sm">
          <div class="relative inline-block">
            <UAvatar
              :src="contact.avatarUrl"
              size="3xl"
              class="h-20 w-20 rounded-full border-2 border-white shadow-sm ring-2 ring-[#e2e8f0]"
            />
            <span
              v-if="contact.isOnline"
              class="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Đang hoạt động"
            />
          </div>

          <h3 class="mt-3 text-lg font-extrabold text-[#0f172a] line-clamp-1">
            {{ contact.name }}
          </h3>

          <p class="mt-0.5 text-xs font-semibold text-[#64748b]">
            {{ contactStatus }}
          </p>

          <!-- Quick Action Buttons -->
          <div class="mt-5 flex w-full justify-center gap-6">
            <NuxtLink
              v-if="contact.profileUrl"
              :to="contact.profileUrl"
              class="group flex flex-col items-center gap-1.5 text-decoration-none"
            >
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2ff] text-[#0000ff] transition-all group-hover:bg-[#0000ff] group-hover:text-white shadow-sm">
                <Icon name="i-ph-user-bold" class="h-5 w-5" />
              </span>
              <span class="text-xs font-bold text-[#475569] group-hover:text-[#0000ff]">
                {{ $t("pages.messagesPage.viewProfile") || "Trang cá nhân" }}
              </span>
            </NuxtLink>

            <button
              type="button"
              class="group flex flex-col items-center gap-1.5 border-0 bg-transparent cursor-pointer"
              :disabled="deletingConversation"
              @click="$emit('delete-conversation')"
            >
              <span class="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all group-hover:bg-red-600 group-hover:text-white shadow-sm">
                <Icon
                  :name="deletingConversation ? 'i-ph-spinner-gap-bold' : 'i-ph-trash-bold'"
                  class="h-5 w-5"
                  :class="{ 'animate-spin': deletingConversation }"
                />
              </span>
              <span class="text-xs font-bold text-[#475569] group-hover:text-red-600">
                {{ $t("pages.messagesPage.deleteConversation") || "Xóa chat" }}
              </span>
            </button>
          </div>
        </section>

        <!-- Options Section -->
        <section class="rounded-2xl bg-white p-2 shadow-sm">
          <div class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
            Tùy chọn
          </div>

          <NuxtLink
            v-if="contact.profileUrl"
            :to="contact.profileUrl"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc] transition-colors text-decoration-none"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#475569]">
              <Icon name="i-ph-user-bold" class="h-5 w-5" />
            </div>
            <span class="flex-1 min-w-0">Xem trang cá nhân</span>
            <Icon name="i-ph-arrow-square-out-bold" class="h-4 w-4 text-[#94a3b8]" />
          </NuxtLink>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-0 bg-transparent text-left cursor-pointer"
            :disabled="deletingConversation"
            @click="$emit('delete-conversation')"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Icon
                :name="deletingConversation ? 'i-ph-spinner-gap-bold' : 'i-ph-trash-bold'"
                class="h-5 w-5"
                :class="{ 'animate-spin': deletingConversation }"
              />
            </div>
            <span class="flex-1 min-w-0">Xóa cuộc trò chuyện</span>
          </button>
        </section>
      </div>
    </template>

    <div v-else class="flex flex-1 items-center justify-center px-6 py-8">
      <div class="max-w-[260px] text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-[#0000ff]">
          <Icon name="i-ph-user-circle-bold" class="h-8 w-8" />
        </div>
        <h3 class="mt-5 text-base font-semibold text-[var(--text-primary)]">
          {{ emptyTitle }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {{ emptyDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact } from "../../domain/types/messages.types"

const props = defineProps<{
  contact?: MessageContact | null
  deletingConversation?: boolean
  emptyDescription: string
  emptyTitle: string
}>()

const { t } = useI18n()

defineEmits<{
  "delete-conversation": []
}>()

const contactStatus = computed(() => {
  const contact = props.contact

  if (!contact) {
    return ""
  }

  if (contact.isOnline) {
    return t("pages.messagesPage.activeNow")
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})
</script>
