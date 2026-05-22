<!-- Description: Renders the center conversation pane with backend-backed threads and contact state. -->
<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
    <template v-if="contact">
      <!-- Toolbar Header -->
      <div class="border-b border-[#f1f5f9] px-6 py-4">
        <div class="flex items-center justify-between gap-4">
          <!-- Left Recipient Metadata -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              class="md:hidden -ml-2 h-10 w-10 shrink-0 justify-center rounded-full p-0 text-slate-500 hover:bg-slate-100"
              @click="$emit('back')"
            >
              <Icon name="i-ph-arrow-left-bold" class="h-5 w-5" />
            </UButton>
            <button class="flex min-w-0 flex-1 items-center gap-3 text-left" type="button" @click="$emit('toggle-info')">
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
                <h3 class="chat-window__header-name">
                  {{ contact.name }}
                </h3>
                <p class="chat-window__header-status">
                  {{ contactStatus }}
                </p>
              </div>
            </button>
          </div>

          <!-- Right Action Buttons (Audio call, Video call, Info, Trash) -->
          <div class="chat-window__header-actions">
            <!-- Audio Call -->
            <button
              class="chat-window__action-btn"
              type="button"
              :title="$t('pages.messagesPage.audioCall') || 'Bắt đầu cuộc gọi thoại'"
              @click="onCall('audio')"
            >
              <Icon name="i-ph-phone-bold" class="chat-window__action-btn-icon" />
            </button>

            <!-- Video Call -->
            <button
              class="chat-window__action-btn"
              type="button"
              :title="$t('pages.messagesPage.videoCall') || 'Bắt đầu cuộc gọi video'"
              @click="onCall('video')"
            >
              <Icon name="i-ph-video-camera-bold" class="chat-window__action-btn-icon" />
            </button>

            <!-- Info Panel Trigger -->
            <button
              class="chat-window__action-btn"
              type="button"
              :title="$t('pages.messagesPage.info') || 'Thông tin'"
              @click="$emit('toggle-info')"
            >
              <Icon name="i-ph-info-bold" class="chat-window__action-btn-icon" />
            </button>

            <!-- Delete/Trash Conversation -->
            <button
              class="chat-window__action-btn chat-window__action-btn--danger"
              type="button"
              :disabled="deletingConversation"
              :title="$t('pages.messagesPage.deleteConversation') || 'Xóa cuộc trò chuyện'"
              @click="$emit('delete-conversation')"
            >
              <Icon v-if="!deletingConversation" name="i-ph-trash-bold" class="chat-window__action-btn-icon" />
              <Icon v-else name="i-ph-spinner-gap-bold" class="chat-window__action-btn-icon animate-spin" />
            </button>
          </div>
        </div>
      </div>

      <!-- Messages Stream -->
      <MessagesChatMessageList
        :contact-avatar="contact.avatarUrl"
        :empty-label="emptyThreadLabel"
        :is-pending="isPending"
        :is-typing="isTyping"
        :loading-label="loadingLabel"
        :messages="messages"
        @load-more="emit('load-more')"
      />

      <!-- Message input composer -->
      <MessagesChatInput
        v-model="inputModel"
        :disabled="isPending || !contact"
        @send="onSendMessage"
      />
    </template>

    <div v-else class="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div class="max-w-[520px] text-center">
        <div class="mx-auto flex w-[210px] flex-col items-center gap-5">
          <div class="relative h-[58px] w-[148px] rounded-[3px] bg-[#fff0cf]">
            <span class="absolute -left-4 top-5 h-0 w-0 border-y-[12px] border-r-[18px] border-y-transparent border-r-[#fff0cf]" />
            <span class="absolute left-7 top-4 h-1.5 w-[105px] rounded-full bg-[#ffd76a]" />
            <span class="absolute left-7 top-8 h-1.5 w-[74px] rounded-full bg-[#ffd76a]" />
          </div>
          <div class="relative ml-16 h-[58px] w-[132px] rounded-[3px] bg-[#c9eff2]">
            <span class="absolute -right-4 top-5 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-[#c9eff2]" />
            <span class="absolute left-4 top-4 h-1.5 w-[103px] rounded-full bg-[#88b7bd]" />
            <span class="absolute left-4 top-8 h-1.5 w-[73px] rounded-full bg-[#88b7bd]" />
          </div>
        </div>
        <h3 class="mt-12 whitespace-pre-line text-[24px] font-medium leading-9 text-[#555]">
          {{ emptyTitle }}
        </h3>
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
  deletingConversation?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  "toggle-info": []
  "load-more": []
  "send": [input: { text: string, file?: File | null }]
  "delete-conversation": []
  "back": []
}>()

const inputModel = ref("")

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

function onSendMessage(input: { text: string, file?: File | null }) {
  emit("send", input)
}

function onCall(type: "audio" | "video") {
  const contact = props.contact
  if (contact && contact.userId) {
    if (type === "video" && typeof window !== "undefined" && (window as any).Wo_GenerateVideoCall) {
      (window as any).Wo_GenerateVideoCall((window as any).wo_user_id || 0, contact.userId)
      return
    } else if (type === "audio" && typeof window !== "undefined" && (window as any).Wo_GenerateVoiceCall) {
      (window as any).Wo_GenerateVoiceCall((window as any).wo_user_id || 0, contact.userId)
      return
    }
  }

  // Fallback visual feedback if call is clicked when running outside WoWonder standalone frames
  emit("send", { text: `[Bắt đầu cuộc gọi ${type === "video" ? "video" : "thoại"}]` })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-window__header-name {
  font-family: 'Roboto', sans-serif !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  color: #414145 !important;
  line-height: 1.2 !important;
  margin: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.chat-window__header-status {
  font-family: 'Roboto', sans-serif !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  color: #8e8e93 !important;
  margin-top: 4px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.chat-window__header-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-shrink: 0 !important;
}

.chat-window__action-btn {
  display: inline-flex !important;
  width: 40px !important;
  height: 40px !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  color: #8e8e93 !important;
  background-color: transparent !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.chat-window__action-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05) !important;
  color: #002aff !important;
}

.chat-window__action-btn--danger:hover:not(:disabled) {
  color: #ef4444 !important;
  background-color: #fee2e2 !important;
}

.chat-window__action-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.chat-window__action-btn-icon {
  width: 20px !important;
  height: 20px !important;
}
</style>
