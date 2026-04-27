<template>
  <div
    ref="listContainer"
    class="scrollbar-hide flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.06),transparent_22%),linear-gradient(180deg,rgba(248,251,255,0.98),rgba(244,248,255,0.95))] px-4 py-6 sm:px-6"
  >
    <div class="mx-auto flex w-full max-w-[1080px] flex-col gap-3">
      <div class="flex justify-center pb-2">
        <UButton
          variant="soft"
          size="sm"
          class="rounded-full bg-white/90 px-6 text-[9px] font-black uppercase tracking-[0.24em] text-[var(--text-primary)] ring-1 ring-secondary-100/80 transition-all shadow-[0_12px_24px_rgba(15,23,42,0.05)] hover:bg-primary-50 hover:text-secondary-900"
          @click="$emit('load-more')"
        >
          {{ $t('pages.messagesPage.loadOlder') }}
        </UButton>
      </div>

      <MessagesPresentationChatBubble
        v-for="message in messages"
        :key="message.id"
        v-bind="message"
      />

      <div v-if="isTyping" class="flex items-end gap-3 pt-2">
        <UAvatar
          :src="typingAvatarUrl || fallbackAvatarUrl"
          size="xs"
          class="ring-1 ring-white shadow-sm"
          :ui="{ rounded: 'rounded-[8px]' }"
        />
        <div class="flex h-10 items-center gap-1.5 rounded-[20px] rounded-bl-md bg-white/96 px-4 ring-1 ring-secondary-100 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style="animation-delay: 0ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500" style="animation-delay: 150ms"></span>
          <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-600" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from "../../domain/types/message.types"
import MessagesPresentationChatBubble from "./ChatBubble.vue"

const props = defineProps<{
  messages: ChatMessage[]
  isTyping?: boolean
  typingAvatarUrl?: string
}>()

defineEmits<{
  "load-more": []
}>()

const fallbackAvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
const listContainer = ref<HTMLElement | null>(null)

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  if (!listContainer.value) return
  listContainer.value.scrollTo({
    top: listContainer.value.scrollHeight,
    behavior,
  })
}

watch(() => props.messages.length, () => {
  nextTick(() => scrollToBottom())
})

onMounted(() => {
  scrollToBottom("auto")
})

defineExpose({ scrollToBottom })
</script>
