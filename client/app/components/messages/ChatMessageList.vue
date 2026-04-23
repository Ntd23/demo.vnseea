<template>
  <div 
    ref="listContainer"
    class="flex-1 min-h-0 overflow-y-auto bg-secondary-50/20 px-6 py-8 space-y-2 scrollbar-hide"
  >
    <div class="flex justify-center pb-4">
      <UButton
        variant="soft"
        size="sm"
        class="rounded-full font-black text-[9px] uppercase tracking-[0.2em] px-6 bg-white text-secondary-400 ring-1 ring-secondary-100/50 hover:bg-primary-50 hover:text-primary-600 transition-all shadow-sm"
        @click="$emit('load-more')"
      >
        {{ $t('pages.messagesPage.loadOlder') }}
      </UButton>
    </div>

    <MessagesChatBubble
      v-for="(msg, idx) in messages"
      :key="idx"
      v-bind="msg"
    />

    <!-- Typing Indicator -->
    <div v-if="isTyping" class="flex items-center gap-3 pt-4">
      <UAvatar
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        size="xs"
        class="ring-1 ring-white shadow-sm"
        :ui="{ rounded: 'rounded-[8px]' }"
      />
      <div class="flex h-9 items-center gap-1.5 rounded-[18px] rounded-bl-md bg-white px-4 ring-1 ring-secondary-100 shadow-sm">
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" style="animation-delay: 0ms"></span>
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-500" style="animation-delay: 150ms"></span>
        <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-600" style="animation-delay: 300ms"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  messages: any[]
  isTyping?: boolean
}>()

defineEmits<{
  'load-more': []
}>()

const listContainer = ref<HTMLElement | null>(null)

function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
  if (!listContainer.value) return
  listContainer.value.scrollTo({
    top: listContainer.value.scrollHeight,
    behavior
  })
}

// Auto scroll on new messages
watch(() => props.messages.length, () => {
  nextTick(() => scrollToBottom())
})

onMounted(() => {
  scrollToBottom('auto')
})

defineExpose({ scrollToBottom })
</script>
