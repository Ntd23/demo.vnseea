<!-- English description: Renders one normalized message bubble with a PHP-style chat rhythm while keeping the current backend-backed message formats. -->
<template>
  <div
    class="flex w-full flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 chat-bubble__container"
    :class="{ 'chat-bubble__container--mine': isMine }"
  >
    <div v-if="showTime" class="my-3 self-center sm:my-4">
      <span class="rounded-full border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-tertiary)] shadow-[var(--shadow-sm)]">
        {{ time }}
      </span>
    </div>

    <div class="flex w-full items-end gap-2.5" :class="isMine ? 'justify-end' : 'justify-start'">
      <div v-if="!isMine" class="mb-0.5 shrink-0 self-end">
        <button
          v-if="isLast && avatar"
          type="button"
          class="chat-bubble__avatar-button"
          @click.stop="emit('avatar-click', $event)"
        >
          <UChip
            :show="Boolean(senderIsOnline)"
            position="bottom-right"
            color="success"
            :ui="{ base: '!bg-emerald-500' }"
            inset
          >
            <UAvatar
              :src="avatar"
              size="xs"
              class="chat-bubble__avatar ring-1 ring-[var(--border-light)] shadow-[var(--shadow-sm)]"
            />
          </UChip>
        </button>
        <div v-else class="w-8" />
      </div>

      <div
        class="group relative w-fit max-w-[80%] lg:max-w-[42rem] chat-bubble__wrapper"
        :class="{
          'chat-bubble__wrapper--product': productCard,
          'chat-bubble__wrapper--shared-post': sharedPost,
          'chat-bubble__wrapper--location': location && !isDeleted,
          'chat-bubble__wrapper--story': storyContext && !isDeleted,
        }"
        :title="timelineTitle"
      >
        <button
          v-if="replyTitle || replyQuote"
          type="button"
          class="chat-bubble__reply"
          :class="{
            'chat-bubble__reply--mine': isMine,
            'chat-bubble__reply--clickable': replyTargetMessageId,
          }"
          :disabled="!replyTargetMessageId"
          @click.stop="replyTargetMessageId && emit('open-reply-target', replyTargetMessageId)"
        >
          <div v-if="replyTitle" class="chat-bubble__reply-title">
            <Icon name="i-ph-arrow-bend-up-left-fill" class="h-3.5 w-3.5" />
            <span>{{ replyTitle }}</span>
          </div>
          <NuxtImg
            v-if="replyMediaUrl"
            :src="replyMediaUrl"
            :alt="replyQuote || replyTitle || 'Reply image'"
            class="chat-bubble__reply-image"
          />
          <div v-else-if="replyQuote" class="chat-bubble__reply-quote">
            {{ replyQuote }}
          </div>
        </button>

        <div
          v-if="callLog"
          class="chat-bubble__call-card"
          :class="{ 'chat-bubble__call-card--missed': isMissedCallLog }"
        >
          <div class="chat-bubble__call-head">
            <UButton
              :icon="callIcon"
              color="neutral"
              variant="outline"
              size="xl"
              square
              class="chat-bubble__call-icon-btn"
              tabindex="-1"
            />
            <div class="chat-bubble__call-copy">
              <p class="chat-bubble__call-title">
                {{ callTitle }}
              </p>
              <p class="chat-bubble__call-subtitle">
                {{ callSubtitle }}
              </p>
            </div>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            size="xl"
            block
            class="chat-bubble__call-again"
            @click="emit('retry-call', callActionPayload)"
          >
            {{ callButtonLabel }}
          </UButton>
        </div>

        <MessageLocationCard
          v-else-if="location && !isDeleted"
          :location="location"
          :avatar-url="locationAvatarUrl"
          :is-mine="isMine"
          :sender-name="authorName"
        />

        <div
          v-else
          class="chat-bubble relative whitespace-pre-wrap px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all duration-300"
          :class="[
            isDeleted ? 'chat-bubble--deleted' : '',
            storyContext && !isDeleted ? 'chat-bubble--story' : '',
            sharedPost && !isDeleted ? 'chat-bubble--shared-post' : '',
            isMine
              ? 'chat-bubble--mine text-[var(--text-inverse)]'
              : 'chat-bubble--theirs border border-[var(--border-light)] text-[var(--text-primary)]'
          ]"
        >
          <p v-if="showAuthor && authorName && !storyContext" class="chat-bubble__author">{{ authorName }}</p>
          <MessageSharedPostCard
            v-if="sharedPost"
            :post="sharedPost"
          />
          <NuxtLink
            v-else-if="productCard"
            :to="productCard.href"
            class="chat-bubble__product-card"
            @click.stop
          >
            <span class="chat-bubble__product-media">
              <img
                v-if="productCard.imageUrl && !productImageFailed"
                :src="productCard.imageUrl"
                :alt="productCard.title"
                loading="lazy"
                @error="productImageFailed = true"
              >
              <Icon v-else name="i-ph-package-duotone" class="h-7 w-7" />
            </span>
            <span class="chat-bubble__product-copy">
              <strong>{{ productCard.title }}</strong>
              <span v-if="productCard.price">{{ productCard.price }}</span>
            </span>
            <Icon name="i-ph-arrow-square-out" class="h-4 w-4 shrink-0" />
          </NuxtLink>
          <StoryMessageCard
            v-if="storyContext"
            :story="storyContext"
            :is-mine="isMine"
            :message-author="authorName"
            :reply-text="text"
          />
          <p
            v-if="text && !storyContext"
            class="chat-bubble__text whitespace-pre-wrap"
            :class="{ 'mt-2.5': productCard || sharedPost }"
          >
            {{ text }}
          </p>

          <div v-if="mediaUrl" :class="text || callLog ? 'mt-2.5' : ''">
            <button
              v-if="mediaType === 'image' || mediaType === 'gif'"
              type="button"
              class="chat-bubble__media-trigger"
              :aria-label="t('pages.messagesPage.attachmentLabel')"
              @click.stop="openMediaViewer"
            >
              <NuxtImg
                :src="mediaUrl"
                :alt="mediaName || text || 'Message media'"
                class="max-h-[360px] rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-surface)] object-contain p-1"
              />
            </button>
            <button
              v-else-if="mediaType === 'video'"
              type="button"
              class="chat-bubble__media-trigger chat-bubble__video-trigger"
              :aria-label="t('pages.messagesPage.video')"
              @click.stop="openMediaViewer"
            >
              <video
                :src="mediaUrl"
                class="max-h-[360px] rounded-[10px]"
                muted
                playsinline
                preload="metadata"
              />
              <span class="chat-bubble__video-play" aria-hidden="true">
                <Icon name="i-ph-play-fill" />
              </span>
            </button>
            <audio
              v-else-if="mediaType === 'audio' || mediaType === 'record'"
              :src="mediaUrl"
              class="min-w-[240px] rounded-[10px]"
              controls
              preload="none"
            />
            <a
              v-else
              :href="mediaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="chat-bubble__file inline-flex items-center gap-2 rounded-[8px] bg-[var(--bg-muted)] px-3 py-2 text-sm font-medium"
            >
              <Icon name="i-ph-paperclip-duotone" class="h-4 w-4" />
              <span class="chat-bubble__file-name">{{ mediaName || mediaUrl }}</span>
            </a>
          </div>
        </div>

        <span v-if="reactionSrc" class="chat-bubble__reaction">
          <img
            :src="reactionSrc"
            :alt="reactionAlt || ''"
            draggable="false"
          >
        </span>

        <div v-if="showTools" class="chat-bubble__message-tools">
          <span v-if="!location" ref="reactionToolRef" class="chat-bubble__message-tool-wrap">
            <button
              type="button"
              class="chat-bubble__message-tool"
              :title="reactTitle"
              @click="emit('toggle-reaction-picker')"
            >
              <Icon name="i-ph-smiley-duotone" class="h-3.5 w-3.5" />
            </button>
            <Teleport to="body" :disabled="!teleportReactionPicker">
              <div
                v-if="reactionPickerOpen"
                class="chat-bubble__reaction-picker"
                :class="{
                  'chat-bubble__reaction-picker--mine': isMine,
                  'chat-bubble__reaction-picker--teleported': teleportReactionPicker,
                }"
                :style="teleportReactionPicker ? reactionPickerPosition : undefined"
              >
                <button
                  v-for="reaction in reactionOptions"
                  :key="reaction.value"
                  type="button"
                  class="chat-bubble__reaction-option"
                  :title="reaction.label"
                  @click="emit('select-reaction', reaction)"
                >
                  <img :src="reaction.src" :alt="reaction.label" draggable="false">
                </button>
              </div>
            </Teleport>
          </span>
          <button
            v-if="!location"
            type="button"
            class="chat-bubble__message-tool"
            :title="replyTitleLabel"
            @click="emit('reply')"
          >
            <Icon name="i-ph-arrow-bend-up-left-bold" class="h-3.5 w-3.5" />
          </button>
          <button
            v-if="canDelete"
            type="button"
            class="chat-bubble__message-tool chat-bubble__message-tool--danger"
            :title="deleteTitle"
            @click="emit('delete')"
          >
            <Icon name="i-ph-trash-duotone" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <MessageMediaViewer
      v-if="previewableMediaType"
      :open="mediaViewerOpen"
      :src="mediaUrl || ''"
      :type="previewableMediaType"
      :alt="mediaName || text"
      @close="mediaViewerOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { MessageCallLogAction } from "../../domain/types/calls.types"
import type {
  MessageProductCard,
  MessageSharedPostCard as MessageSharedPostCardData,
  MessageStoryContext,
} from "../../domain/types/messages.types"
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"
import type { MessageLocationMeta } from "../../application/utils/message-location"
import MessageLocationCard from "./MessageLocationCard.vue"
import MessageMediaViewer from "./MessageMediaViewer.vue"
import MessageSharedPostCard from "./MessageSharedPostCard.vue"
import StoryMessageCard from "./StoryMessageCard.vue"

type ChatBubbleReactionOption = {
  value: FeedStoryReactionType
  src: string
  label: string
}

const props = defineProps<{
  text: string
  isMine: boolean
  isLast?: boolean
  showAuthor?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
  senderIsOnline?: boolean
  authorName?: string
  timelineTitle?: string
  replyTitle?: string
  replyQuote?: string
  replyMediaUrl?: string
  replyTargetMessageId?: number | null
  reactionSrc?: string
  reactionAlt?: string
  showTools?: boolean
  reactionPickerOpen?: boolean
  teleportReactionPicker?: boolean
  reactionOptions?: ChatBubbleReactionOption[]
  reactTitle?: string
  replyTitleLabel?: string
  deleteTitle?: string
  canDelete?: boolean
  isDeleted?: boolean
  mediaUrl?: string
  mediaName?: string
  mediaType?: "image" | "video" | "audio" | "gif" | "file" | "record"
  productCard?: MessageProductCard
  sharedPost?: MessageSharedPostCardData
  storyContext?: MessageStoryContext
  location?: MessageLocationMeta | null
  callLog?: {
    type: "audio" | "video"
    status: string
    duration?: number
    callId?: number
    groupId?: number
    isGroup?: boolean
    isActive?: boolean
    participantCount?: number
  }
}>()

const emit = defineEmits<{
  "retry-call": [payload: MessageCallLogAction]
  "avatar-click": [event: MouseEvent]
  "toggle-reaction-picker": []
  "select-reaction": [reaction: ChatBubbleReactionOption]
  "reply": []
  "open-reply-target": [messageId: number]
  "delete": []
}>()

const { t } = useI18n()
const currentAuthUserStore = useCurrentAuthUserStore()
const productImageFailed = ref(false)
const mediaViewerOpen = ref(false)
const previewableMediaType = computed(() =>
  props.mediaType === "image" || props.mediaType === "gif" || props.mediaType === "video"
    ? props.mediaType
    : null,
)
const locationAvatarUrl = computed(() =>
  (props.isMine ? currentAuthUserStore.user?.avatarUrl : props.avatar)
  || "",
)

watch(() => props.productCard?.imageUrl, () => {
  productImageFailed.value = false
})

watch(() => props.mediaUrl, () => {
  mediaViewerOpen.value = false
})

function openMediaViewer() {
  if (!props.mediaUrl || !previewableMediaType.value) return

  mediaViewerOpen.value = true
}

const isMissedCallLog = computed(() => {
  if (!props.callLog) {
    return false
  }

  return !props.isMine && (props.callLog.status === "no_answer" || props.callLog.status === "missed")
})

const callTitle = computed(() => {
  if (!props.callLog) {
    return ""
  }

  const call = props.callLog.type === "video"
    ? t("pages.messagesPage.callLogVideo")
    : t("pages.messagesPage.callLogAudio")

  if (props.callLog.status === "no_answer" || props.callLog.status === "missed") {
    return props.isMine
      ? t("pages.messagesPage.callLogNoAnswer", { call })
      : t("pages.messagesPage.callLogMissed", { call })
  }

  if (props.callLog.status === "cancelled") {
    return t("pages.messagesPage.callLogCancelled", { call })
  }

  if (props.callLog.status === "declined") {
    return props.isMine
      ? t("pages.messagesPage.callLogRecipientDeclined", { call })
      : t("pages.messagesPage.callLogDeclined", { call })
  }

  return call
})

const callIcon = computed(() => {
  if (!props.callLog) {
    return "i-ph-phone-x-bold"
  }

  if (props.callLog.status === "no_answer" || props.callLog.status === "missed") {
    return "i-ph-phone-x-bold"
  }

  return props.callLog.type === "video"
    ? "i-ph-video-camera-fill"
    : "i-ph-phone-call-fill"
})

const callDurationLabel = computed(() => {
  const seconds = Math.max(0, Math.floor(props.callLog?.duration ?? 0))

  if (seconds <= 0) {
    return ""
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return t("pages.messagesPage.callLogDurationHours", {
      hours,
      minutes,
    })
  }

  if (minutes > 0) {
    return remainingSeconds > 0
      ? t("pages.messagesPage.callLogDurationMinutesSeconds", {
          minutes,
          seconds: remainingSeconds,
        })
      : t("pages.messagesPage.callLogDurationMinutes", {
          minutes,
        })
  }

  return t("pages.messagesPage.callLogDurationSeconds", {
    seconds: remainingSeconds,
  })
})

const callSubtitle = computed(() => {
  if (props.callLog?.isGroup && props.callLog.isActive && props.callLog.participantCount) {
    return t("pages.messagesPage.groupCallActiveParticipants", {
      count: props.callLog.participantCount,
    })
  }

  if (callDurationLabel.value) {
    return callDurationLabel.value
  }

  return props.time || ""
})

const callActionPayload = computed<MessageCallLogAction>(() => ({
  type: props.callLog?.type ?? "video",
  action: props.callLog?.isGroup && props.callLog.isActive && props.callLog.callId ? "join" : "start",
  callId: props.callLog?.callId,
  groupId: props.callLog?.groupId,
}))

const callButtonLabel = computed(() =>
  callActionPayload.value.action === "join"
    ? t("pages.messagesPage.callLogJoin")
    : t("pages.messagesPage.callLogRetry"),
)

const reactionOptions = computed(() => props.reactionOptions ?? [])
const reactionToolRef = ref<HTMLElement | null>(null)
const reactionPickerPosition = ref<Record<string, string>>({})

function updateReactionPickerPosition() {
  if (!import.meta.client || !props.teleportReactionPicker || !reactionToolRef.value) {
    return
  }

  const triggerRect = reactionToolRef.value.getBoundingClientRect()
  const pickerWidth = 190
  const pickerHeight = 48
  const gutter = 8
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const preferredLeft = props.isMine
    ? triggerRect.left
    : triggerRect.right - pickerWidth
  const left = Math.min(Math.max(gutter, preferredLeft), Math.max(gutter, viewportWidth - pickerWidth - gutter))
  const aboveTop = triggerRect.top - pickerHeight - 7
  const top = aboveTop >= gutter
    ? aboveTop
    : Math.min(viewportHeight - pickerHeight - gutter, triggerRect.bottom + 7)

  reactionPickerPosition.value = {
    left: `${left}px`,
    top: `${Math.max(gutter, top)}px`,
  }
}

watch(() => props.reactionPickerOpen, (isOpen) => {
  if (isOpen) {
    void nextTick(updateReactionPickerPosition)
  }
}, { flush: "post" })

onMounted(() => window.addEventListener("resize", updateReactionPickerPosition))
onBeforeUnmount(() => window.removeEventListener("resize", updateReactionPickerPosition))

const reactTitle = computed(() => props.reactTitle || t("navigation.chatWidget.reactToMessage"))
const replyTitleLabel = computed(() => props.replyTitleLabel || t("navigation.chatWidget.replyMessage"))
const deleteTitle = computed(() => props.deleteTitle || t("navigation.chatWidget.deleteMessage"))
</script>

<style scoped>
.chat-bubble {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-family: var(--font-primary), sans-serif;
  font-weight: 400;
}

.chat-bubble__container {
  min-width: 0;
}

.chat-bubble__author {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--text-secondary);
}

.chat-bubble__product-card {
  display: grid;
  width: 100%;
  max-width: 100%;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-surface);
  padding: 7px;
  color: var(--text-primary);
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.chat-bubble__product-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.chat-bubble__product-media {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9px;
  background: var(--bg-surface-active);
  color: var(--text-brand);
}

.chat-bubble__wrapper--product {
  width: min(310px, 100%);
}

.chat-bubble__wrapper--shared-post {
  width: min(250px, 82%);
  max-width: min(250px, 82%) !important;
}

.chat-bubble--shared-post {
  overflow: visible;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
}

.chat-bubble--shared-post .chat-bubble__text {
  width: fit-content;
  max-width: 100%;
  border-radius: 14px;
  background: var(--bg-muted);
  padding: 8px 11px;
  color: var(--text-primary);
}

.chat-bubble__wrapper--location {
  width: min(300px, 78vw);
}

.chat-bubble__wrapper--location :deep(.message-location-card) {
  width: 100%;
}

.chat-bubble__product-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-bubble__product-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.chat-bubble__product-copy strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.chat-bubble__product-copy span {
  color: var(--bg-brand, var(--bg-brand));
  font-size: 14px;
  font-weight: 800;
}

.chat-bubble--mine {
  background: var(--bg-brand);
  border-radius: 18px 18px 6px 18px;
  box-shadow: var(--shadow-sm);
}

.chat-bubble--theirs {
  background: var(--bg-muted);
  border-radius: 18px 18px 18px 6px;
  box-shadow: var(--shadow-sm);
}

.chat-bubble--deleted {
  color: var(--text-tertiary) !important;
  font-style: italic;
  background: var(--bg-muted) !important;
  border: 1px solid var(--border-light) !important;
}

.chat-bubble__call-card {
  width: min(250px, 74vw);
  border-radius: 18px;
  background: var(--bg-muted);
  padding: 14px 14px 12px;
}

.chat-bubble__call-head {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 10px;
  align-items: center;
}

.chat-bubble__call-icon-btn {
  width: 44px !important;
  height: 44px !important;
  border-radius: 999px !important;
  color: var(--text-primary) !important;
  background: var(--bg-surface-active) !important;
  pointer-events: none;
}

.chat-bubble__call-card--missed .chat-bubble__call-icon-btn {
  color: var(--text-danger) !important;
  background: color-mix(in srgb, var(--color-error) 12%, var(--bg-surface)) !important;
  border-color: color-mix(in srgb, var(--color-error) 28%, var(--border-light)) !important;
}

.chat-bubble__call-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.chat-bubble__call-title {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 750;
  line-height: 1.08;
}

.chat-bubble__call-card--missed .chat-bubble__call-title,
.chat-bubble__call-card--missed .chat-bubble__call-subtitle {
  color: var(--text-danger);
}

.chat-bubble__call-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 450;
  line-height: 1.12;
  padding: 5px 0 5px 0;
}

.chat-bubble__call-again {
  margin-top: 12px;
  min-height: 44px;
  border-radius: 8px !important;
  background: var(--bg-surface-active) !important;
  color: var(--text-primary) !important;
  font-size: 18px !important;
  font-weight: 650 !important;
}

.chat-bubble__call-card--missed .chat-bubble__call-again {
  background: var(--color-error) !important;
  color: var(--text-inverse) !important;
  border-color: var(--color-error) !important;
}

.chat-bubble__call-again:hover {
  background: var(--bg-surface-hover) !important;
}

.chat-bubble__call-card--missed .chat-bubble__call-again:hover {
  background: color-mix(in srgb, var(--color-error) 82%, var(--bg-media)) !important;
  border-color: color-mix(in srgb, var(--color-error) 82%, var(--bg-media)) !important;
}

.chat-bubble__avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50%;
  border: none;
}

.chat-bubble__avatar-button {
  display: inline-flex;
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.chat-bubble__wrapper {
  display: flex;
  min-width: 0;
  max-width: min(80%, 34rem) !important;
  flex-direction: column;
  align-items: flex-start;
}

.chat-bubble__wrapper.chat-bubble__wrapper--story {
  width: fit-content;
  max-width: min(92%, 40rem) !important;
}

.chat-bubble__text {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-bubble__file {
  max-width: 100%;
  min-width: 0;
}

.chat-bubble__file-name {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-bubble__container--mine .chat-bubble__wrapper {
  align-items: flex-end;
}

@media (min-width: 640px) {
  .chat-bubble__wrapper {
    max-width: min(80%, 34rem) !important;
  }

  .chat-bubble__wrapper.chat-bubble__wrapper--story {
    max-width: min(92%, 40rem) !important;
  }

  .chat-bubble__wrapper--location {
    width: 300px;
  }
}

.chat-bubble__reply {
  display: flex;
  max-width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  margin: 0 0 2px;
  color: var(--text-secondary);
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  text-align: left;
}

.chat-bubble__reply--clickable {
  cursor: pointer;
}

.chat-bubble__reply--clickable:hover .chat-bubble__reply-quote,
.chat-bubble__reply--clickable:focus-visible .chat-bubble__reply-quote {
  outline: 2px solid color-mix(in srgb, var(--bg-brand, var(--bg-brand)) 28%, transparent);
  outline-offset: 1px;
}

.chat-bubble__reply--mine {
  align-items: flex-end;
}

.chat-bubble__reply-title {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}

.chat-bubble__reply-title span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-bubble__reply-quote {
  max-width: min(220px, 100%);
  overflow: hidden;
  border-radius: 14px;
  background: var(--bg-muted);
  padding: 7px 11px;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-bubble__reply--mine .chat-bubble__reply-quote {
  max-width: min(220px, 100%);
}

.chat-bubble__reply-image {
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  object-fit: cover;
}

.chat-bubble__reaction {
  display: inline-flex;
  position: absolute;
  right: -8px;
  bottom: -12px;
  z-index: 60;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--bg-surface);
  padding: 3px;
  box-shadow: var(--shadow-md);
}

.chat-bubble__reaction img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.chat-bubble__container--mine .chat-bubble__reaction {
  right: auto;
  left: -8px;
}

.chat-bubble__message-tools {
  display: inline-flex;
  position: absolute;
  top: 50%;
  right: -60px;
  z-index: 50;
  align-items: center;
  gap: 3px;
  padding: 3px;
  opacity: 0;
  transform: translateY(-50%) scale(0.96);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.chat-bubble__container--mine .chat-bubble__message-tools {
  right: auto;
  left: -90px;
}

.chat-bubble__wrapper:hover .chat-bubble__message-tools,
.chat-bubble__wrapper:focus-within .chat-bubble__message-tools {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.chat-bubble__message-tool {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.15s ease;
}

.chat-bubble__message-tool-wrap {
  position: relative;
  display: inline-flex;
}

.chat-bubble__message-tool:hover {
  background: color-mix(in srgb, var(--bg-brand) 6%, transparent);
  color: var(--bg-brand);
}

.chat-bubble__message-tool--danger:hover {
  background: color-mix(in srgb, var(--color-error) 12%, var(--bg-surface));
  color: var(--text-danger);
}

.chat-bubble__reaction-picker {
  position: absolute;
  right: 0;
  left: auto;
  bottom: calc(100% + 7px);
  z-index: 70;
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-surface);
  padding: 5px 7px;
  box-shadow: var(--shadow-lg);
  transform: none;
}

.chat-bubble__media-trigger {
  position: relative;
  display: block;
  max-width: 100%;
  overflow: hidden;
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 0;
  cursor: zoom-in;
}

.chat-bubble__media-trigger img,
.chat-bubble__media-trigger video {
  display: block;
  max-width: 100%;
}

.chat-bubble__media-trigger:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--bg-brand) 58%, #fff);
  outline-offset: 3px;
}

.chat-bubble__video-trigger {
  background: #000;
}

.chat-bubble__video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 999px;
  background: rgb(0 0 0 / 58%);
  color: #fff;
  box-shadow: 0 8px 24px rgb(0 0 0 / 24%);
  transform: translate(-50%, -50%);
  transition: background 0.15s ease, transform 0.15s ease;
}

.chat-bubble__media-trigger:hover .chat-bubble__video-play {
  background: rgb(0 0 0 / 72%);
  transform: translate(-50%, -50%) scale(1.06);
}

.chat-bubble--story,
.chat-bubble--story.chat-bubble--mine,
.chat-bubble--story.chat-bubble--theirs {
  overflow: visible;
  border: 0 !important;
  border-radius: 0;
  background: transparent;
  padding: 0;
  color: var(--text-primary);
  box-shadow: none;
}

/* Keep the picker inside the scrolling chat viewport instead of letting it
 * extend past the left edge for messages sent by the current user. */
.chat-bubble__reaction-picker--mine {
  right: auto;
  left: 0;
}

.chat-bubble__reaction-picker--teleported {
  position: fixed;
  right: auto;
  bottom: auto;
  z-index: 10000;
}

.chat-bubble__reaction-option {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  transition: background 0.15s ease, transform 0.15s ease;
}

.chat-bubble__reaction-option:hover {
  background: var(--bg-muted);
  transform: translateY(-2px) scale(1.08);
}

.chat-bubble__reaction-option img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
</style>

