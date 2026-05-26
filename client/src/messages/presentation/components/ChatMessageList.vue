<!-- Description: Renders the current thread stack, load-older control, and typing indicator for the active conversation shell. -->
<template>
  <div
    ref="listContainer"
    class="scrollbar-hide flex-1 min-h-0 overflow-y-auto bg-white px-4 py-5 sm:px-6"
  >
    <div class="mx-auto flex w-full flex-col gap-3" :class="threadWidthClass">
      <div v-if="messages.length > 0" class="flex justify-center pb-2">
        <UButton
          variant="soft"
          size="sm"
          class="rounded-full border border-[var(--border-light)] bg-white px-4 text-[11px] font-semibold text-[var(--text-secondary)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
          @click="$emit('load-more')"
        >
          {{ $t('pages.messagesPage.loadOlder') }}
        </UButton>
      </div>

      <MessagesChatBubble
        v-for="msg in messages"
        :key="msg.id"
        v-bind="msg"
        @retry-call="emit('retry-call', $event)"
      />

      <div v-if="isPending && messages.length === 0" class="rounded-[20px] border border-dashed border-[#dbe3f2] bg-white/80 px-5 py-8 text-center text-sm text-slate-500">
        {{ loadingLabel }}
      </div>

      <div v-else-if="messages.length === 0" class="rounded-[20px] border border-dashed border-[#dbe3f2] bg-white/80 px-5 py-8 text-center text-sm text-slate-500">
        {{ emptyLabel }}
      </div>

      <div v-if="isTyping" class="flex items-end gap-3 pt-2">
        <UAvatar
          v-if="contactAvatar"
          :src="contactAvatar"
          size="xs"
          class="rounded-[8px] ring-1 ring-white shadow-sm"
        />
        <div v-else class="w-8" />
        <div class="messages-typing-bubble" aria-label="Typing">
          <span class="messages-typing-dot" style="animation-delay: 0ms" />
          <span class="messages-typing-dot" style="animation-delay: 180ms" />
          <span class="messages-typing-dot" style="animation-delay: 360ms" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import type { MessageCallLogAction } from "../../domain/types/calls.types"
import type { MessageItem, MessageThreadType } from "../../domain/types/messages.types"
import MessagesChatBubble from "./ChatBubble.vue"

const props = defineProps<{
  contactAvatar?: string
  contactType?: MessageThreadType
  emptyLabel: string
  isPending?: boolean
  isTyping?: boolean
  loadingLabel: string
  messages: MessageItem[]
}>()

const emit = defineEmits<{
  "load-more": []
  "retry-call": [payload: MessageCallLogAction]
}>()

const listContainer = ref<HTMLElement | null>(null)
const threadWidthClass = computed(() =>
  props.contactType === "user" ? "max-w-[760px]" : "max-w-[920px]",
)

function scrollToBottom(behavior: ScrollBehavior = "smooth") {
  if (!listContainer.value) {
    return
  }

  listContainer.value.scrollTo({
    top: listContainer.value.scrollHeight,
    behavior,
  })
}

watch(() => props.messages.length, () => {
  nextTick(() => scrollToBottom())
})

watch(() => props.isTyping, () => {
  nextTick(() => scrollToBottom())
})

onMounted(() => {
  scrollToBottom("auto")
})

defineExpose({ scrollToBottom })
</script>

<style scoped>
.messages-typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  border-bottom-left-radius: 6px;
  background: #f1f0f0;
  padding: 12px 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.messages-typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #7c8799;
  animation: messages-typing-bounce 1s infinite ease-in-out;
}

@keyframes messages-typing-bounce {
  0%, 60%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
</style>
