<!-- Description: Renders one normalized message bubble from backend-provided text and media fields. -->
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
          :ui="{ rounded: 'rounded-full' }"
        />
        <div v-else class="w-8" />
      </div>

      <div class="group relative w-fit max-w-[84%] sm:max-w-[74%] lg:max-w-[42rem] chat-bubble__wrapper">
        <div
          class="chat-bubble relative whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-all duration-300"
          :class="[
            isMine
              ? 'chat-bubble--mine text-white'
              : 'chat-bubble--theirs text-[var(--text-primary)] border border-slate-100'
          ]"
        >
          <p v-if="text" class="whitespace-pre-wrap">{{ text }}</p>

          <div v-if="mediaUrl" :class="text ? 'mt-2.5' : ''">
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
              v-else-if="mediaType === 'audio'"
              :src="mediaUrl"
              class="min-w-[240px] rounded-[10px]"
              controls
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
defineProps<{
  text: string
  isMine: boolean
  isLast?: boolean
  time?: string
  showTime?: boolean
  avatar?: string
  mediaUrl?: string
  mediaName?: string
  mediaType?: "image" | "video" | "audio" | "gif" | "file"
}>()
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-bubble__container,
.chat-bubble__wrapper {
  font-family: 'Roboto', sans-serif !important;
}

.chat-bubble {
  font-family: 'Roboto', sans-serif !important;
  font-weight: 400;
}

.chat-bubble--mine {
  background: var(--bg-brand, #a84849);
  border-radius: 12px 12px 2px 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.chat-bubble--theirs {
  background: #f1f0f0;
  border-radius: 12px 12px 12px 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.chat-bubble__avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50%;
  border: none;
}
</style>

