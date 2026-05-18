<!-- Description: Renders the composer for the active thread and disables submission when no real conversation is available. -->
<template>
  <div class="relative z-10 shrink-0 border-t border-[#f1f5f9] bg-white px-4 py-3 sm:px-10">
    <div class="flex items-center gap-6">
      <div class="relative flex min-h-[72px] flex-1 items-center rounded-[14px] bg-[#f8f8f8] px-6">
        <button
          class="mr-5 inline-flex h-9 w-9 shrink-0 items-center justify-center text-[#b6b6b6] transition hover:text-[var(--text-brand)] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          :disabled="disabled"
          @click="fileInput?.click()"
        >
          <Icon name="i-ph-notepad-duotone" class="h-8 w-8" />
        </button>
        <textarea
          ref="textarea"
          v-model="modelValue"
          rows="1"
          class="no-scrollbar max-h-[120px] w-full resize-none bg-transparent py-2 pr-14 text-[18px] font-semibold text-[var(--text-primary)] outline-none placeholder:text-[#9ca3af]"
          :disabled="disabled"
          :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
          @input="adjustHeight"
          @keydown.enter.prevent="onSend"
        />
        <button
          class="absolute right-5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#b6b6b6] transition hover:text-[var(--text-brand)] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          :disabled="disabled"
        >
          <Icon name="i-ph-microphone-duotone" class="h-8 w-8" />
        </button>
      </div>

      <UButton
        class="h-[70px] w-[70px] shrink-0 justify-center rounded-[14px] bg-[var(--bg-brand)] text-white shadow-none transition-all hover:bg-[var(--bg-brand-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="disabled"
        square
        @click="onSend"
      >
        <Icon name="i-ph-paper-plane-tilt-bold" class="h-9 w-9" />
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
