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
              class="-ml-2 h-10 w-10 shrink-0 justify-center rounded-full p-0 text-[var(--text-primary)] md:hidden"
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
                  <Icon name="i-ph-users-three-bold" class="h-5 w-5" />
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
                  class="h-10 w-10 justify-center rounded-full text-[var(--text-primary)]"
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
                  class="h-10 w-10 justify-center rounded-full text-[var(--text-primary)]"
                  :loading="callActionPending"
                  :disabled="callActionPending"
                  @click="handleStartCall('video')"
                />
              </UTooltip>
            </template>
            <template v-else-if="contact.type === 'group'">
              <UTooltip :text="$t('pages.messagesPage.groupVideoCall')">
                <UButton
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-ph-video-camera-bold"
                  class="h-10 w-10 justify-center rounded-full text-[var(--text-primary)]"
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
                class="h-10 w-10 justify-center rounded-full text-[var(--text-primary)]"
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
        :contact-name="contact.name"
        :contact-type="contact.type"
        :is-pending="isPending"
        :is-typing="isTyping"
        :loading-label="loadingLabel"
        :messages="messages"
        :thread-key="threadKey"
        :active-reaction-picker-id="activeReactionPickerId"
        @load-more="$emit('load-more')"
        @retry-call="$emit('start-call', $event)"
        @toggle-reaction-picker="$emit('toggle-reaction-picker', $event)"
        @select-reaction="(messageId, reaction) => $emit('select-reaction', messageId, reaction)"
        @reply-message="$emit('reply-message', $event)"
        @delete-message="$emit('delete-message', $event)"
      />

      <div v-if="productContextPending" class="chat-window-product-context" aria-live="polite">
        <div class="chat-window-product-skeleton">
          <USkeleton class="chat-window-product-skeleton__image" />
          <div class="chat-window-product-skeleton__copy">
            <USkeleton class="chat-window-product-skeleton__title" />
            <USkeleton class="chat-window-product-skeleton__price" />
          </div>
        </div>
      </div>

      <div v-else-if="productCard" class="chat-window-product-context">
        <div class="chat-window-product-card">
          <NuxtLink
            :to="productCard.href"
            class="chat-window-product-card__link"
          >
            <div class="chat-window-product-card__media">
              <NuxtImg
                v-if="productCard.imageUrl && !productImageFailed"
                :src="productCard.imageUrl"
                :alt="productCard.title"
                class="chat-window-product-card__image"
                @error="productImageFailed = true"
              />
              <Icon v-else name="i-ph-package-bold" class="chat-window-product-card__fallback" />
            </div>

            <div class="chat-window-product-card__copy">
              <p class="chat-window-product-card__title">{{ productCard.title }}</p>
              <p class="chat-window-product-card__price">{{ productCard.price }}</p>
            </div>

            <Icon name="i-ph-arrow-square-out-bold" class="chat-window-product-card__external" />
          </NuxtLink>

          <UTooltip :text="$t('pages.productsPage.removeProductFromMessage')">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-ph-x-bold"
              class="chat-window-product-card__close"
              :aria-label="$t('pages.productsPage.removeProductFromMessage')"
              @click="$emit('dismiss-product-context')"
            />
          </UTooltip>
        </div>

        <div v-if="productSuggestions?.length" class="chat-window-product-suggestions">
          <p class="chat-window-product-suggestions__label">
            {{ $t("pages.productsPage.productQuickQuestions") }}
          </p>
          <div class="chat-window-product-suggestions__scroller">
            <button
              v-for="suggestion in productSuggestions"
              :key="suggestion"
              type="button"
              class="chat-window-product-suggestions__item"
              @click="$emit('send-product-suggestion', suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="replyTarget" class="chat-window-reply">
        <div class="chat-window-reply__bar" />
        <div class="chat-window-reply__copy">
          <p class="chat-window-reply__title">
            {{ replyTitle }}
          </p>
          <NuxtImg
            v-if="replyPreviewMediaUrl"
            :src="replyPreviewMediaUrl"
            :alt="replyPreviewText || replyTitle || 'Reply image'"
            class="chat-window-reply__image"
          />
          <p v-if="!replyPreviewMediaUrl" class="chat-window-reply__text">
            {{ replyPreviewText }}
          </p>
        </div>
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          icon="i-ph-x-bold"
          class="chat-window-reply__close"
          @click="$emit('clear-reply')"
        />
      </div>

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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { MessageCallLogAction, MessageCallType } from "../../domain/types/calls.types"
import type { MessageComposerDraft, MessageContact, MessageGroupDetails, MessageItem, MessageProductCard, MessageTabKey } from "../../domain/types/messages.types"
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"
import MessagesChatInput from "./ChatInput.vue"
import MessagesChatMessageList from "./ChatMessageList.vue"

const props = defineProps<{
  activeTab: MessageTabKey
  contact?: MessageContact | null
  groupDetails?: MessageGroupDetails | null
  groupTypingAvatarUrl?: string
  emptyDescription: string
  emptyTitle: string
  isPending?: boolean
  inboxPending?: boolean
  messages: MessageItem[]
  activeReactionPickerId?: number | null
  replyTarget?: MessageItem | null
  replyTitle?: string
  replyPreviewText?: string
  replyPreviewMediaUrl?: string
  isTyping?: boolean
  deletingConversation?: boolean
  callActionPending?: boolean
  userDetailDocked?: boolean
  threadKey?: string
  productCard?: MessageProductCard | null
  productContextPending?: boolean
  productSuggestions?: string[]
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
  "toggle-reaction-picker": [messageId: number]
  "select-reaction": [messageId: number, reaction: FeedStoryReactionType]
  "reply-message": [message: MessageItem]
  "delete-message": [message: MessageItem]
  "clear-reply": []
  "send-product-suggestion": [text: string]
  "dismiss-product-context": []
}>()

const inputModel = ref("")
const productImageFailed = ref(false)

watch(() => props.productCard?.imageUrl, () => {
  productImageFailed.value = false
})

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

.chat-window-reply {
  display: grid;
  grid-template-columns: 3px minmax(0, 1fr) 36px;
  gap: 10px;
  align-items: center;
  border-top: 1px solid #eef2f7;
  background: #fbfcfe;
  padding: 9px 14px;
}

.chat-window-reply__bar {
  width: 3px;
  height: 34px;
  border-radius: 999px;
  background: var(--bg-brand, #a84849);
}

.chat-window-reply__copy {
  min-width: 0;
}

.chat-window-reply__title {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.2;
}

.chat-window-reply__text {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-window-reply__image {
  width: 46px;
  height: 46px;
  margin-top: 4px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  object-fit: cover;
}

.chat-window-reply__close {
  width: 34px !important;
  height: 34px !important;
  justify-content: center;
  border-radius: 999px !important;
}

.chat-window-product-context {
  flex-shrink: 0;
  border-top: 1px solid #e7ecf3;
  background: #f8faff;
  padding: 10px 12px;
}

.chat-window-product-card {
  position: relative;
  display: flex;
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dfe6f1;
  border-radius: 14px;
  background: var(--bg-surface);
  box-shadow: 0 4px 14px rgb(15 23 42 / 5%);
}

.chat-window-product-card__link {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 52px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  padding: 8px 44px 8px 8px;
  text-decoration: none;
}

.chat-window-product-card__media {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  background: #eef2ff;
  color: var(--color-primary-600, #4f46e5);
}

.chat-window-product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-window-product-card__fallback {
  width: 24px;
  height: 24px;
}

.chat-window-product-card__copy {
  min-width: 0;
}

.chat-window-product-card__title {
  overflow: hidden;
  color: #172033;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-window-product-card__price {
  margin-top: 3px;
  overflow: hidden;
  color: var(--color-primary-600, #4f46e5);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-window-product-card__external {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.chat-window-product-card__close {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 32px !important;
  height: 32px !important;
  transform: translateY(-50%);
  justify-content: center;
  border-radius: 999px !important;
}

.chat-window-product-suggestions {
  min-width: 0;
  margin-top: 9px;
}

.chat-window-product-suggestions__label {
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.chat-window-product-suggestions__scroller {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.chat-window-product-suggestions__item {
  flex: 0 0 auto;
  max-width: min(78vw, 300px);
  border: 1px solid #dbe4f2;
  border-radius: 999px;
  background: var(--bg-surface);
  padding: 7px 11px;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
  white-space: nowrap;
}

.chat-window-product-suggestions__item:hover {
  border-color: var(--color-primary-300, #a5b4fc);
  background: var(--color-primary-50, #eef2ff);
  color: var(--color-primary-700, #4338ca);
}

.chat-window-product-skeleton {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: var(--bg-surface);
  padding: 8px;
}

.chat-window-product-skeleton__image {
  width: 52px !important;
  height: 52px !important;
  flex: 0 0 52px;
  border-radius: 10px !important;
}

.chat-window-product-skeleton__copy {
  min-width: 0;
  flex: 1;
}

.chat-window-product-skeleton__title {
  width: min(220px, 70%) !important;
  height: 15px !important;
}

.chat-window-product-skeleton__price {
  width: 92px !important;
  height: 13px !important;
  margin-top: 8px;
}

@media (min-width: 768px) {
  .chat-window-product-context {
    padding-inline: 16px;
  }

  .chat-window-product-suggestions__scroller {
    flex-wrap: wrap;
    overflow-x: visible;
  }
}
</style>
