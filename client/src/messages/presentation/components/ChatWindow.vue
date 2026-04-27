<template>
  <div class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/86 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
    <div class="relative z-10 shrink-0 border-b border-secondary-100/80 bg-white/92 px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:px-6">
      <div class="flex items-center justify-between gap-4">
        <div class="group flex min-w-0 cursor-pointer items-center gap-3 rounded-[22px] p-2 transition-all duration-300 hover:bg-secondary-50/90" @click="$emit('toggle-info')">
          <div class="relative shrink-0">
            <UAvatar
              :src="participant.avatarUrl"
              :alt="participant.name"
              size="lg"
              class="ring-2 ring-white shadow-md transition-transform group-hover:scale-105"
              :ui="{ rounded: 'rounded-[14px]' }"
            />
            <span
              class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
              :class="participant.isOnline ? 'bg-sky-500' : 'bg-secondary-300'"
            />
          </div>
          <div class="min-w-0 space-y-1">
            <h3 class="truncate text-[13px] font-black uppercase tracking-[0.18em] text-[var(--text-primary)] transition-colors group-hover:text-secondary-900">{{ participant.name }}</h3>
            <div class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full" :class="participant.isOnline ? 'bg-sky-500 animate-pulse' : 'bg-secondary-300'" />
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-primary)]">{{ participant.status }}</p>
            </div>
          </div>
        </div>

        <div class="hidden items-center gap-2 rounded-[22px] bg-secondary-50/80 p-2 ring-1 ring-secondary-100/80 sm:flex">
          <UButton
            v-for="btn in actionButtons"
            :key="btn.label"
            variant="ghost"
            color="primary"
            class="h-10 w-10 rounded-[16px] text-[var(--text-primary)] transition-all hover:bg-primary-600 hover:text-white active:scale-90 justify-center"
            square
            @click="btn.label === 'info' ? $emit('toggle-info') : null"
          >
            <Icon :name="btn.icon" class="h-5 w-5" />
          </UButton>
        </div>
      </div>
    </div>

    <MessagesPresentationChatMessageList
      :messages="messages"
      :is-typing="isTyping"
      :typing-avatar-url="participant.avatarUrl"
      @load-more="$emit('load-more')"
    />

    <MessagesPresentationChatInput
      v-model="modelValue"
      @send="$emit('send', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, MessageContact } from "../../domain/types/message.types"
import MessagesPresentationChatInput from "./ChatInput.vue"
import MessagesPresentationChatMessageList from "./ChatMessageList.vue"

const modelValue = defineModel<string>({ default: "" })

defineProps<{
  messages: ChatMessage[]
  isTyping?: boolean
  participant: MessageContact
}>()

defineEmits<{
  "toggle-info": []
  "load-more": []
  send: [value: string]
}>()

const actionButtons = [
  { icon: "i-ph-phone-duotone", label: "call" },
  { icon: "i-ph-video-camera-duotone", label: "video" },
  { icon: "i-ph-info-duotone", label: "info" },
] as const
</script>
