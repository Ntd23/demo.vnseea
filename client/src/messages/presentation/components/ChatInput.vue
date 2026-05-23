<!-- Description: Renders the composer for the active thread and disables submission when no real conversation is available. -->
<template>
  <div class="chat-input__container">
    <div class="chat-input__wrapper">
      <!-- Input Box Combo -->
      <div class="chat-input__combo">
        <!-- Attachment Button -->
        <button
          class="chat-input__option-btn"
          type="button"
          :disabled="disabled"
          @click="fileInput?.click()"
        >
          <Icon name="i-ph-notepad-duotone" class="h-6 w-6" />
        </button>

        <!-- Textarea Input -->
        <textarea
          ref="textarea"
          v-model="modelValue"
          rows="1"
          class="chat-input__textarea"
          :disabled="disabled"
          :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
          @input="adjustHeight"
          @keydown.enter.prevent="onSend"
        />

        <!-- Microphone Button -->
        <button
          class="chat-input__option-btn"
          type="button"
          :disabled="disabled"
        >
          <Icon name="i-ph-microphone-duotone" class="h-6 w-6" />
        </button>
      </div>

      <!-- Send Button -->
      <button
        class="chat-input__send-btn"
        :disabled="disabled"
        type="button"
        @click="onSend"
      >
        <Icon name="i-ph-paper-plane-tilt-bold" class="h-6 w-6" />
      </button>
    </div>

    <!-- File Attachment Preview -->
    <div v-if="fileModel" class="chat-input__file-preview">
      <span class="truncate font-medium">{{ fileModel.name }}</span>
      <button
        class="chat-input__file-remove-btn"
        type="button"
        @click="clearFile"
      >
        {{ $t("pages.messagesPage.removeAttachment") }}
      </button>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.chat-input__container {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
  background-color: #ffffff;
  padding: 16px 20px;
  font-family: 'Roboto', sans-serif !important;
}

@media (min-width: 640px) {
  .chat-input__container {
    padding: 20px 30px;
  }
}

.chat-input__wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 100%;
}

.chat-input__combo {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 56px;
  background-color: #f8f8f8;
  border: 1px solid #f1f1f1;
  border-radius: 12px;
  padding: 0 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-input__combo:focus-within {
  background-color: #ffffff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.chat-input__option-btn {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #b6b6b6;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chat-input__option-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.06);
  color: var(--text-brand, #a84849);
}

.chat-input__option-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-input__textarea {
  width: 100%;
  resize: none;
  background: transparent;
  border: 0;
  outline: none;
  padding: 16px 8px;
  font-family: 'Roboto', sans-serif !important;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary, #1e293b);
  max-height: 120px;
  line-height: 1.4;
}

.chat-input__textarea::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.chat-input__send-btn {
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: var(--bg-brand, #a84849);
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

.chat-input__send-btn:hover:not(:disabled) {
  background-color: var(--bg-brand-hover, #c45a5b);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.chat-input__send-btn:active:not(:disabled) {
  transform: scale(0.96);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.chat-input__send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input__file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: #475569;
}

.chat-input__file-remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.chat-input__file-remove-btn:hover {
  background-color: #fee2e2;
}
</style>
