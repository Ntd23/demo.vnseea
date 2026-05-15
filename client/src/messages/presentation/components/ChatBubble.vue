<!-- Description: Renders one normalized message bubble from backend-provided text and media fields. -->
<template>
  <div class="flex w-full flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div v-if="showTime" class="my-3 self-center sm:my-4">
      <span class="rounded-full bg-white/92 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-[var(--text-primary)] ring-1 ring-secondary-100 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        {{ time }}
      </span>
    </div>

    <div class="flex w-full items-end gap-3" :class="isMine ? 'justify-end' : 'justify-start'">
      <div v-if="!isMine" class="mb-1 shrink-0 self-end">
        <UAvatar
          v-if="isLast && avatar"
          :src="avatar"
          size="xs"
          class="ring-1 ring-white shadow-sm"
          :ui="{ rounded: 'rounded-[8px]' }"
        />
        <div v-else class="w-8" />
      </div>

      <div class="group relative w-fit max-w-[84%] sm:max-w-[74%] lg:max-w-[42rem]">
        <div
          class="relative whitespace-pre-wrap px-5 py-3.5 text-[15px] leading-7 shadow-md transition-all duration-300"
          :class="[
            isMine
              ? 'rounded-[24px] rounded-br-lg bg-gradient-to-br from-primary-500 via-primary-600 to-sky-600 text-white font-medium ring-1 ring-primary-500/40 shadow-[0_16px_34px_rgba(14,165,233,0.22)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.25)]'
              : 'rounded-[24px] rounded-bl-lg bg-white/96 text-[var(--text-primary)] font-medium ring-1 ring-secondary-100 shadow-[0_16px_34px_rgba(15,23,42,0.06)] hover:ring-primary-500/20'
          ]"
        >
          <p v-if="text" class="whitespace-pre-wrap">{{ text }}</p>

          <div v-if="mediaUrl" :class="text ? 'mt-3' : ''">
            <NuxtImg
              v-if="mediaType === 'image' || mediaType === 'gif'"
              :src="mediaUrl"
              :alt="mediaName || text || 'Message media'"
              class="max-h-[360px] rounded-[18px] object-contain"
            />
            <video
              v-else-if="mediaType === 'video'"
              :src="mediaUrl"
              class="max-h-[360px] rounded-[18px]"
              controls
              playsinline
            />
            <audio
              v-else-if="mediaType === 'audio'"
              :src="mediaUrl"
              class="min-w-[240px]"
              controls
            />
            <a
              v-else
              :href="mediaUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-[16px] bg-white/15 px-3 py-2 text-sm font-semibold"
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
