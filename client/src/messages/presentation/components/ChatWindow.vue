<!-- Description: Renders the active conversation pane with a PHP-style header shell, thread content, one-to-one typing state, and the scoped message composer. -->
<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
    <template v-if="contact">
      <div class="border-b border-[var(--border-light)] bg-[#fcfdff] px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              class="-ml-2 h-10 w-10 shrink-0 justify-center rounded-full p-0 text-slate-500 md:hidden"
              @click="$emit('back')"
            >
              <Icon name="i-ph-arrow-left-bold" class="h-5 w-5" />
            </UButton>

            <button
              class="flex min-w-0 flex-1 items-center gap-3 text-left"
              :class="userDetailDocked && contact.type === 'user' ? 'xl:pointer-events-none xl:cursor-default' : ''"
              type="button"
              @click="handleToggleInfo"
            >
              <UChip
                :show="contact.type === 'user' ? contact.isOnline : groupHasActiveMember"
                position="bottom-right"
                color="success"
                :ui="{ base: '!bg-emerald-500' }"
                inset
                class="shrink-0"
              >
                <div
                  v-if="contact.type === 'group' && !headerAvatarUrl"
                  class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600"
                >
                  <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
                </div>
                <UAvatar
                  v-else
                  :src="headerAvatarUrl"
                  size="lg"
                  class="rounded-full"
                />
              </UChip>

              <div class="min-w-0">
                <h3 class="truncate text-[16px] font-semibold text-[var(--text-primary)]">
                  {{ headerName }}
                </h3>
                <p class="truncate text-[13px] font-medium text-[var(--text-secondary)]">
                  {{ contactStatus }}
                </p>
              </div>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <template v-if="contact.type === 'user'">
              <UTooltip :text="$t('pages.messagesPage.call')">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-phone-bold"
                  class="h-10 w-10 justify-center rounded-full"
                  :loading="callActionPending"
                  :disabled="callActionPending"
                  @click="handleStartCall('audio')"
                />
              </UTooltip>

              <UTooltip :text="$t('pages.messagesPage.video')">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-video-camera-bold"
                  class="h-10 w-10 justify-center rounded-full"
                  :loading="callActionPending"
                  :disabled="callActionPending"
                  @click="handleStartCall('video')"
                />
              </UTooltip>
            </template>
            <template v-else-if="contact.type === 'group'">
              <UTooltip :text="$t('pages.messagesPage.groupAudioCall')">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-phone-bold"
                  class="h-10 w-10 justify-center rounded-full"
                  :loading="callActionPending"
                  :disabled="callActionPending"
                  @click="handleStartCall('audio')"
                />
              </UTooltip>

              <UTooltip :text="$t('pages.messagesPage.groupVideoCall')">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-video-camera-bold"
                  class="h-10 w-10 justify-center rounded-full"
                  :loading="callActionPending"
                  :disabled="callActionPending"
                  @click="handleStartCall('video')"
                />
              </UTooltip>
            </template>

            <UTooltip :text="$t('pages.messagesPage.info')">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-ph-info-bold"
                class="h-10 w-10 justify-center rounded-full"
                :class="userDetailDocked && contact.type === 'user' ? 'xl:hidden' : ''"
                @click="handleToggleInfo"
              />
            </UTooltip>

            <UTooltip :text="$t('pages.messagesPage.deleteConversation')">
              <UButton
                type="button"
                color="error"
                variant="ghost"
                :icon="deletingConversation ? 'i-ph-spinner-gap-bold' : 'i-ph-trash-bold'"
                class="h-10 w-10 justify-center rounded-full"
                :loading="deletingConversation"
                @click="$emit('delete-conversation')"
              />
            </UTooltip>
          </div>
        </div>
      </div>

      <MessagesChatMessageList
        :contact-avatar="typingAvatarUrl"
        :contact-type="contact.type"
        :empty-label="emptyThreadLabel"
        :is-pending="isPending"
        :is-typing="isTyping"
        :loading-label="loadingLabel"
        :messages="messages"
        @load-more="$emit('load-more')"
        @retry-call="$emit('start-call', $event)"
      />

      <MessagesChatInput
        v-model="inputModel"
        :disabled="!contact"
        @typing-start="$emit('typing-start')"
        @typing-stop="$emit('typing-stop')"
        @send="onSendMessage"
      />
    </template>

    <div v-else-if="inboxPending" class="flex min-h-0 flex-1 flex-col bg-white">
      <div class="border-b border-[var(--border-light)] bg-[#fcfdff] px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <USkeleton class="chat-window-header-skeleton__avatar" />
            <div class="chat-window-header-skeleton__copy">
              <USkeleton class="chat-window-header-skeleton__title" />
              <USkeleton class="chat-window-header-skeleton__status" />
            </div>
          </div>
          <div class="chat-window-header-skeleton__actions">
            <USkeleton v-for="i in 4" :key="i" class="chat-window-header-skeleton__icon" />
          </div>
        </div>
      </div>

      <MessagesChatMessageList
        contact-type="user"
        :empty-label="emptyThreadLabel"
        :is-pending="true"
        :loading-label="loadingLabel"
        :messages="[]"
      />
    </div>

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
        <p class="mt-3 text-sm text-[var(--text-secondary)]">
          {{ emptyDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { MessageCallLogAction, MessageCallType } from "../../domain/types/calls.types"
import type { MessageComposerDraft, MessageContact, MessageGroupDetails, MessageItem, MessageTabKey } from "../../domain/types/messages.types"
import MessagesChatInput from "./ChatInput.vue"
import MessagesChatMessageList from "./ChatMessageList.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  contact?: MessageContact | null
  groupDetails?: MessageGroupDetails | null
  groupTypingAvatarUrl?: string
  emptyDescription: string
  emptyThreadLabel: string
  emptyTitle: string
  isPending?: boolean
  inboxPending?: boolean
  messages: MessageItem[]
  isTyping?: boolean
  deletingConversation?: boolean
  callActionPending?: boolean
  userDetailDocked?: boolean
}>()

const { t } = useI18n()

const emit = defineEmits<{
  "toggle-info": []
  "load-more": []
  "send": [input: MessageComposerDraft]
  "delete-conversation": []
  "back": []
  "typing-start": []
  "typing-stop": []
  "start-call": [payload: MessageCallType | MessageCallLogAction]
}>()

const inputModel = ref("")

const headerAvatarUrl = computed(() =>
  props.groupDetails?.avatarUrl || props.contact?.avatarUrl || "",
)

const typingAvatarUrl = computed(() =>
  props.contact?.type === "group"
    ? props.groupTypingAvatarUrl || ""
    : headerAvatarUrl.value,
)

const headerName = computed(() =>
  props.groupDetails?.name || props.contact?.name || "",
)

const contactStatus = computed(() => {
  const contact = props.contact

  if (!contact) {
    return ""
  }

  if (contact.type === "group") {
    const count = props.groupDetails?.memberCount ?? contact.memberCount ?? 0
    const onlineCount = groupOnlineMemberCount.value
    const memberStatus = t("pages.messagesPage.groupMembersStatus", { count })

    return onlineCount > 0
      ? `${memberStatus}, ${onlineCount} đang hoạt động`
      : memberStatus
  }

  if (contact.isOnline) {
    return t("pages.messagesPage.activeNow")
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})

const groupHasActiveMember = computed(() =>
  props.contact?.type === "group"
  && Boolean(
    groupOnlineMemberCount.value > 0
    || props.contact.isOnline,
  ),
)

const groupOnlineMemberCount = computed(() =>
  props.groupDetails?.members.filter(member => !member.isSelf && member.isOnline).length ?? 0,
)

const loadingLabel = computed(() => t("pages.messagesPage.loadingMessages"))

function onSendMessage(input: MessageComposerDraft) {
  emit("send", input)
}

function handleToggleInfo() {
  emit("toggle-info")
}

function handleStartCall(type: MessageCallType) {
  if (!props.contact || (props.contact.type === "user" && !props.contact.userId) || (props.contact.type === "group" && !props.contact.groupId)) {
    return
  }

  emit("start-call", type)
}
</script>

<style scoped>
.chat-window-header-skeleton__avatar {
  width: 44px !important;
  height: 44px !important;
  flex: 0 0 44px;
  border-radius: 999px !important;
  background: #e8edf4 !important;
}

.chat-window-header-skeleton__copy {
  min-width: 0;
  flex: 1;
}

.chat-window-header-skeleton__title {
  width: 158px !important;
  height: 18px !important;
  border-radius: 999px !important;
  background: #dfe5ee !important;
}

.chat-window-header-skeleton__status {
  width: 122px !important;
  height: 14px !important;
  margin-top: 7px;
  border-radius: 999px !important;
  background: #e8edf4 !important;
}

.chat-window-header-skeleton__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chat-window-header-skeleton__icon {
  width: 40px !important;
  height: 40px !important;
  border-radius: 999px !important;
  background: #e8edf4 !important;
}
</style>
