<!-- Description: Renders the composer for the active thread and disables submission when no real conversation is available. -->
<template>
  <div class="relative z-10 shrink-0 border-t border-secondary-100/80 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6">
    <div class="mx-auto flex max-w-[1080px] items-center gap-3 rounded-[26px] border border-white/80 bg-white p-2.5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      <div class="hidden shrink-0 items-center gap-2 rounded-[18px] bg-secondary-50/80 p-1.5 ring-1 ring-secondary-100 sm:flex">
        <UButton
          variant="soft"
          class="h-10 w-10 shrink-0 rounded-[14px] bg-white text-[var(--text-primary)] ring-1 ring-secondary-100 shadow-none transition-all hover:bg-primary-50 hover:text-secondary-900 justify-center"
          square
          type="button"
          @click="fileInput?.click()"
        >
          <Icon name="i-ph-plus-circle-duotone" class="h-5 w-5" />
        </UButton>
        <UButton
          v-for="icon in ['i-ph-image-duotone', 'i-ph-paperclip-duotone']"
          :key="icon"
          variant="soft"
          class="h-10 w-10 rounded-[14px] bg-transparent text-[var(--text-primary)] shadow-none transition-all hover:bg-white hover:text-secondary-900 justify-center"
          square
          type="button"
          @click="fileInput?.click()"
        >
          <Icon :name="icon" class="h-4 w-4" />
        </UButton>
      </div>

      <div class="relative flex-1">
        <textarea
          ref="textarea"
          v-model="modelValue"
          rows="1"
          class="no-scrollbar w-full max-h-[140px] resize-none rounded-[20px] bg-secondary-50/75 px-5 py-3 pr-14 text-sm font-medium text-[var(--text-primary)] outline-none ring-1 ring-secondary-100 transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-primary-500"
          :disabled="disabled"
          :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
          @input="adjustHeight"
          @keydown.enter.prevent="onSend"
        />
        <div class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center">
          <MessagesMessageEmojiPicker @select="onEmoji" />
        </div>
      </div>

      <UButton
        class="h-12 w-12 shrink-0 rounded-[18px] bg-gradient-to-r from-primary-600 to-sky-600 text-white shadow-[0_16px_28px_rgba(14,165,233,0.24)] transition-all hover:-translate-y-0.5 hover:from-primary-700 hover:to-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 justify-center"
        :disabled="disabled"
        square
        @click="onSend"
      >
        <Icon name="i-ph-paper-plane-tilt-bold" class="h-5 w-5" />
      </UButton>
    </div>

    <div v-if="fileModel" class="mx-auto mt-2 flex max-w-[1080px] items-center justify-between gap-3 rounded-[18px] border border-secondary-100 bg-white px-4 py-2 text-sm text-slate-600">
      <span class="truncate">{{ fileModel.name }}</span>
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        class="rounded-full"
        type="button"
        @click="clearFile"
      >
        {{ $t("pages.messagesPage.removeAttachment") }}
      </UButton>
    </div>

    <input
      ref="fileInput"
      type="file"
      class="hidden"
      @change="onFileChange"
    >
  </div>
</template>

<script setup lang="ts">
import MessagesMessageEmojiPicker from "./MessageEmojiPicker.vue"

const modelValue = defineModel<string>({ default: "" })

defineProps<{
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [value: { text: string, file?: File | null }]
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const fileModel = ref<File | null>(null)

function adjustHeight() {
  if (!textarea.value) {
    return
  }

  textarea.value.style.height = "auto"
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

function onEmoji(emoji: string) {
  modelValue.value += emoji
}

function onSend() {
  const content = modelValue.value.trim()

  if (content || fileModel.value) {
    emit("send", {
      text: content,
      file: fileModel.value,
    })
    modelValue.value = ""
    clearFile()
    nextTick(() => {
      if (textarea.value) {
        textarea.value.style.height = "auto"
      }
    })
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  fileModel.value = input.files?.[0] ?? null
}

function clearFile() {
  fileModel.value = null

  if (fileInput.value) {
    fileInput.value.value = ""
  }
}
</script>
