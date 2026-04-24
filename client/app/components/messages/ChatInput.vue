<template>
  <div class="relative z-10 shrink-0 border-t border-secondary-100/80 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6">
    <div class="mx-auto flex max-w-[1080px] items-center gap-3 rounded-[26px] border border-white/80 bg-white p-2.5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div class="hidden shrink-0 items-center gap-2 rounded-[18px] bg-secondary-50/80 p-1.5 ring-1 ring-secondary-100 sm:flex">
        <UButton
          variant="soft"
          class="h-10 w-10 shrink-0 rounded-[14px] bg-white text-secondary-400 ring-1 ring-secondary-100 transition-all shadow-none hover:bg-primary-50 hover:text-secondary-900 justify-center"
          square
        >
          <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
        </UButton>
        <UButton
          v-for="icon in ['i-ph-image-duotone', 'i-ph-chat-circle-dots-duotone', 'i-ph-gif-duotone']"
          :key="icon"
          variant="soft"
          class="h-10 w-10 rounded-[14px] bg-transparent text-secondary-400 transition-all shadow-none hover:bg-white hover:text-secondary-900 justify-center"
          square
        >
          <Icon :name="icon" class="h-4 w-4" />
        </UButton>
      </div>

      <div class="relative flex-1">
        <textarea 
          ref="textarea"
          v-model="modelValue"
          rows="1" 
          class="no-scrollbar w-full max-h-[140px] rounded-[20px] bg-secondary-50/75 px-5 py-3 pr-14 text-sm font-medium text-secondary-900 outline-none ring-1 ring-secondary-100 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-primary-500 resize-none" 
          :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
          @input="adjustHeight"
          @keydown.enter.prevent="onSend"
        />
        <div class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center">
          <MessagesMessageEmojiPicker @select="onEmoji" />
        </div>
      </div>

      <UButton
        class="h-12 w-12 shrink-0 rounded-[18px] bg-gradient-to-r from-primary-600 to-sky-600 text-white shadow-[0_16px_28px_rgba(14,165,233,0.24)] transition-all hover:-translate-y-0.5 hover:from-primary-700 hover:to-sky-700 active:scale-95 justify-center"
        square
        @click="onSend"
      >
        <Icon name="i-ph-paper-plane-tilt-bold" class="h-5 w-5" />
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>({ default: "" })

defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [value: string]
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)

function adjustHeight() {
  if (!textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

function onEmoji(emoji: string) {
  modelValue.value += emoji
}

function onSend() {
  const content = modelValue.value.trim()
  if (content) {
    emit('send', content)
    modelValue.value = ""
    nextTick(() => {
      if (textarea.value) textarea.value.style.height = 'auto'
    })
  }
}
</script>
