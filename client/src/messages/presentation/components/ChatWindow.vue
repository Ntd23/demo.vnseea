<!-- Description: Renders the center conversation pane with backend-backed threads and contact state. -->
<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
    <template v-if="contact">
      <div class="border-b border-[#f1f5f9] px-6 py-4">
        <div class="flex items-center justify-between gap-4">
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
                <h3 class="truncate text-base font-black text-[var(--text-primary)]">
                  {{ contact.name }}
                </h3>
                <p class="truncate text-sm text-slate-500">
                  {{ contactStatus }}
                </p>
              </div>
            </button>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <UButton
              variant="ghost"
              color="neutral"
              class="h-10 w-10 shrink-0 justify-center rounded-full xl:hidden"
              @click="$emit('toggle-info')"
            >
              <Icon name="i-ph-info-duotone" class="h-5 w-5" />
            </UButton>
            <div class="hidden items-center gap-2 sm:flex">
              <UButton
                v-for="button in actionButtons"
                :key="button.id"
                variant="soft"
                :color="button.id === 'delete' ? 'error' : 'neutral'"
                class="rounded-full px-4 font-semibold"
                :loading="button.id === 'delete' && deletingConversation"
                @click="onAction(button.id)"
              >
                <template #leading>
                  <Icon :name="button.icon" class="h-4 w-4" />
                </template>
                {{ button.text }}
              </UButton>
            </div>
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

    <MessagesChatInput
      v-model="inputModel"
      :disabled="isPending || !contact"
      @send="onSendMessage"
    />
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

const actionButtons = computed(() => [
  { icon: "i-ph-info-duotone", id: "info", text: t("pages.messagesPage.info") },
  { icon: "i-ph-trash-duotone", id: "delete", text: t("pages.messagesPage.deleteConversation") },
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

function onSendMessage(input: { text: string, file?: File | null }) {
  emit("send", input)
}

function onAction(id: string) {
  if (id === "info") {
    emit("toggle-info")
    return
  }

  if (id === "delete") {
    emit("delete-conversation")
  }
}
</script>
