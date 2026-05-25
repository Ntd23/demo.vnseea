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
    duration: number
  }
}>()

const callTitle = computed(() => {
  if (!props.callLog) {
    return ""
  }

  const base = props.callLog.type === "video" ? "Cuoc goi video" : "Cuoc goi thoai"

  if (props.callLog.status === "no_answer") {
    return `${base} - khong tra loi`
  }

  if (props.callLog.status === "cancelled") {
    return `${base} - da huy`
  }

  if (props.callLog.status === "declined") {
    return `${base} - bi tu choi`
  }

  return base
})

const callDurationLabel = computed(() => {
  const seconds = Math.max(0, Math.floor(props.callLog?.duration ?? 0))

  if (seconds <= 0) {
    return ""
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
})
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

.chat-bubble__call-log {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 168px;
}

.chat-bubble__call-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  flex: 0 0 auto;
  font-size: 18px;
}

.chat-bubble__call-icon--mine {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.chat-bubble__call-icon--theirs {
  background: #ffffff;
  color: var(--bg-brand, #a84849);
}

.chat-bubble__call-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 1px;
}

.chat-bubble__call-title {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
}

.chat-bubble__call-duration {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  opacity: 0.76;
}

.chat-bubble__avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50%;
  border: none;
}
</style>

