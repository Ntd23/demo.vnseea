<template>
  <div class="shrink-0 bg-white px-6 py-6 border-t border-secondary-100 relative z-10">
    <div class="flex items-end gap-3 max-w-[1200px] mx-auto">
      <UButton
        variant="soft"
        class="h-12 w-12 rounded-2xl bg-secondary-50 text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-all flex-shrink-0 justify-center h-12 shadow-none ring-1 ring-secondary-100"
        square
      >
        <Icon name="i-ph-plus-circle-duotone" class="h-6 w-6" />
      </UButton>

      <div class="hidden shrink-0 items-center gap-2 lg:flex">
        <UButton
          v-for="icon in ['i-ph-image-duotone', 'i-ph-sticker-duotone', 'i-ph-gif-duotone']"
          :key="icon"
          variant="soft"
          class="h-12 w-12 rounded-2xl bg-secondary-50 text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-all justify-center shadow-none h-12 ring-1 ring-secondary-100"
          square
        >
          <Icon :name="icon" class="h-6 w-6" />
        </UButton>
      </div>

      <div class="flex-1 relative group">
        <textarea 
          ref="textarea"
          v-model="modelValue"
          rows="1" 
          class="w-full max-h-[140px] rounded-2xl bg-secondary-50/50 px-6 py-4 text-sm font-medium text-secondary-900 border-none ring-1 ring-secondary-100 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-300 outline-none resize-none no-scrollbar pr-14" 
          :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
          @input="adjustHeight"
          @keydown.enter.prevent="onSend"
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center">
          <MessagesMessageEmojiPicker @select="onEmoji" />
        </div>
      </div>

      <UButton
        class="h-12 w-12 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-black shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex-shrink-0 justify-center h-12"
        square
        @click="onSend"
      >
        <Icon name="i-ph-paper-plane-tilt-bold" class="h-6 w-6" />
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
