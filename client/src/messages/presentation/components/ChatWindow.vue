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
              <div class="relative shrink-0">
                <div
                  v-if="contact.type === 'group' && !headerAvatarUrl"
                  class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary-50 text-primary-600"
                >
                  <Icon name="i-ph-users-three-fill" class="h-5 w-5" />
                </div>
                <UAvatar
                  v-else
                  :src="headerAvatarUrl"
                  size="lg"
                  class="rounded-[16px]"
                />
                <span
                  v-if="contact.type === 'user'"
                  class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                  :class="contact.isOnline ? 'bg-emerald-500' : 'bg-slate-300'"
                />
              </div>

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
        :contact-avatar="contact.avatarUrl"
        :contact-type="contact.type"
        :empty-label="emptyThreadLabel"
        :is-pending="isPending"
        :is-typing="isTyping"
        :loading-label="loadingLabel"
        :messages="messages"
        @load-more="$emit('load-more')"
      />

      <MessagesChatInput
        v-model="inputModel"
        :disabled="isPending || !contact"
        @typing-start="$emit('typing-start')"
        @typing-stop="$emit('typing-stop')"
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
        <p class="mt-3 text-sm text-[var(--text-secondary)]">
          {{ emptyDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import type { MessageComposerDraft, MessageContact, MessageGroupDetails, MessageItem, MessageTabKey } from "../../domain/types/messages.types"
import MessagesChatInput from "./ChatInput.vue"
import MessagesChatMessageList from "./ChatMessageList.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  contact?: MessageContact | null
  groupDetails?: MessageGroupDetails | null
  emptyDescription: string
  emptyThreadLabel: string
  emptyTitle: string
  isPending?: boolean
  messages: MessageItem[]
  isTyping?: boolean
  deletingConversation?: boolean
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
}>()

const inputModel = ref("")

const headerAvatarUrl = computed(() =>
  props.groupDetails?.avatarUrl || props.contact?.avatarUrl || "",
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
    return t("pages.messagesPage.groupMembersStatus", {
      count: props.groupDetails?.memberCount ?? contact.memberCount ?? 0,
    })
  }

  if (contact.isOnline) {
    return t("pages.messagesPage.activeNow")
  }

  return contact.status || t("pages.messagesPage.activeRecently")
})

const loadingLabel = computed(() => t("pages.messagesPage.loadingMessages"))

function onSendMessage(input: MessageComposerDraft) {
  emit("send", input)
}

function handleToggleInfo() {
  emit("toggle-info")
}
</script>
