<!-- Description: Renders one normalized message bubble with a PHP-style chat rhythm while keeping the current backend-backed message formats. -->
<template>
  <div class="flex w-full flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 chat-bubble__container">
    <div v-if="showTime" class="my-3 self-center sm:my-4">
      <span class="rounded-full bg-[#f6f6f6] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8e8e93] border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {{ time }}
      </span>
    </div>

    <div class="flex w-full items-end gap-2.5" :class="isMine ? 'justify-end' : 'justify-start'">
      <div v-if="!isMine" class="mb-0.5 shrink-0 self-end">
        <UAvatar
          v-if="isLast && avatar"
          :src="avatar"
          size="xs"
          class="ring-1 ring-white shadow-sm chat-bubble__avatar"
        />
        <div v-else class="w-8" />
      </div>

      <div class="group relative w-fit max-w-[84%] sm:max-w-[74%] lg:max-w-[42rem] chat-bubble__wrapper">
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

        <div
          v-else
          class="chat-bubble relative whitespace-pre-wrap px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all duration-300"
          :class="[
            isMine
              ? 'chat-bubble--mine text-white'
              : 'chat-bubble--theirs text-[var(--text-primary)] border border-slate-100'
          ]"
        >
          <p v-if="showAuthor && authorName" class="chat-bubble__author">{{ authorName }}</p>
          <p v-if="text" class="whitespace-pre-wrap">{{ text }}</p>

          <div v-if="mediaUrl" :class="text || callLog ? 'mt-2.5' : ''">
            <NuxtImg
              v-if="mediaType === 'image' || mediaType === 'gif'"
              :src="mediaUrl"
              :alt="mediaName || text || 'Message media'"
              class="max-h-[360px] rounded-[10px] object-contain bg-white border border-slate-100 p-1"
            />
            <video
              v-else-if="mediaType === 'video'"
              :src="mediaUrl"
              class="max-h-[360px] rounded-[10px]"
              controls
              playsinline
            />
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
              class="inline-flex items-center gap-2 rounded-[8px] bg-black/5 px-3 py-2 text-sm font-medium"
            >
              <Icon name="i-ph-paperclip-duotone" class="h-4 w-4" />
              <span>{{ mediaName || mediaUrl }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessageCallLogAction } from "../../domain/types/calls.types"

const props = defineProps<{
  text: string
  isMine: boolean
  isLast?: boolean
  showAuthor?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
  authorName?: string
  mediaUrl?: string
  mediaName?: string
  mediaType?: "image" | "video" | "audio" | "gif" | "file" | "record"
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
}>()

const { t } = useI18n()

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
</script>

<style scoped>
.chat-bubble {
  font-family: var(--font-primary), sans-serif;
  font-weight: 400;
}

.chat-bubble__author {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #64748b;
}

.chat-bubble--mine {
  background: var(--bg-brand, #a84849);
  border-radius: 18px 18px 6px 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.chat-bubble--theirs {
  background: #f1f0f0;
  border-radius: 18px 18px 18px 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.chat-bubble__call-card {
  width: min(250px, 74vw);
  border-radius: 18px;
  background: #f1f1f1;
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
  color: #050505 !important;
  background: #e2e5e9 !important;
  pointer-events: none;
}

.chat-bubble__call-card--missed .chat-bubble__call-icon-btn {
  color: #dc2626 !important;
  background: #fee2e2 !important;
  border-color: #fecaca !important;
}

.chat-bubble__call-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.chat-bubble__call-title {
  color: #050505;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.08;
}

.chat-bubble__call-card--missed .chat-bubble__call-title,
.chat-bubble__call-card--missed .chat-bubble__call-subtitle {
  color: #dc2626;
}

.chat-bubble__call-subtitle {
  color: #65676b;
  font-size: 14px;
  font-weight: 450;
  line-height: 1.12;
  padding: 5px 0 5px 0;
}

.chat-bubble__call-again {
  margin-top: 12px;
  min-height: 44px;
  border-radius: 8px !important;
  background: #868687 !important;
  color: #050505 !important;
  font-size: 18px !important;
  font-weight: 650 !important;
}

.chat-bubble__call-card--missed .chat-bubble__call-again {
  background: #dc2626 !important;
  color: #ffffff !important;
  border-color: #dc2626 !important;
}

.chat-bubble__call-again:hover {
  background: #d8dce2 !important;
}

.chat-bubble__call-card--missed .chat-bubble__call-again:hover {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

.chat-bubble__avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50%;
  border: none;
}
</style>

