<!-- Description: Renders the center conversation pane with backend-backed threads and no invented fallback contact state. -->
<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white">
    <template v-if="contact">
      <div class="border-b border-[#e2e8f0] px-5 py-4">
        <div class="flex items-center justify-between gap-4">
          <button class="flex min-w-0 items-center gap-3 text-left" type="button" @click="$emit('toggle-info')">
            <div class="relative shrink-0">
              <UAvatar
                :src="contact.avatarUrl"
                size="lg"
                :ui="{ rounded: 'rounded-[16px]' }"
              />
              <span
                class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                :class="contact.isOnline ? 'bg-emerald-500' : 'bg-slate-300'"
              />
            </div>
            <div class="min-w-0">
              <h3 class="truncate text-base font-black text-[var(--text-primary)]">
                {{ contact.name }}
              </h3>
              <p class="truncate text-sm text-slate-500">
                {{ contactStatus }}
              </p>
            </div>
          </button>

          <div class="hidden items-center gap-2 sm:flex">
            <UButton
              v-for="button in actionButtons"
              :key="button.id"
              variant="soft"
              color="neutral"
              class="rounded-full px-4 font-semibold"
              @click="button.id === 'info' ? $emit('toggle-info') : null"
            >
              <template #leading>
                <Icon :name="button.icon" class="h-4 w-4" />
              </template>
              {{ button.text }}
            </UButton>
          </div>
        </div>
      </div>

      <MessagesChatMessageList
        :contact-avatar="contact.avatarUrl"
        :empty-label="emptyThreadLabel"
        :is-pending="isPending"
        :is-typing="isTyping"
        :loading-label="loadingLabel"
        :messages="messages"
        @load-more="emit('load-more')"
      />

      <MessagesChatInput
        v-model="inputModel"
        :disabled="isPending"
        @send="onSendMessage"
      />
    </template>

    <div v-else class="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div class="max-w-[420px] text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary-50 text-primary-600">
          <Icon
            :name="activeTab === 'multi' ? 'i-ph-user-list-duotone' : 'i-ph-chat-circle-text-duotone'"
            class="h-8 w-8"
          />
        </div>
        <h3 class="mt-5 text-lg font-black text-[var(--text-primary)]">
          {{ emptyTitle }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{ emptyDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageContact, MessageItem, MessageTabKey } from "../../domain/types/messages.types"
import MessagesChatInput from "./ChatInput.vue"
import MessagesChatMessageList from "./ChatMessageList.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  contact?: MessageContact | null
  emptyDescription: string
  emptyThreadLabel: string
  emptyTitle: string
  isPending?: boolean
  messages: MessageItem[]
  isTyping?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  "toggle-info": []
  "load-more": []
  "send": [text: string]
}>()

const inputModel = ref("")

const actionButtons = computed(() => [
  { icon: "i-ph-phone-duotone", id: "call", text: t("pages.messagesPage.call") },
  { icon: "i-ph-video-camera-duotone", id: "video", text: t("pages.messagesPage.video") },
  { icon: "i-ph-info-duotone", id: "info", text: t("pages.messagesPage.info") },
])

const contactStatus = computed(() => {
  const contact = props.contact

  if (!contact) {
    return ""
  }

  if (contact.type === "group" && contact.memberCount) {
    return t("pages.messagesPage.groupMembersStatus", {
      count: contact.memberCount,
    })
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})

const loadingLabel = computed(() => t("pages.messagesPage.loadingMessages"))

function onSendMessage(text: string) {
  emit("send", text)
}
</script>
