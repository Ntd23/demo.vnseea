<!-- English description: Renders the active thread composer with a PHP-style core shell for text, file, and voice note sending plus one-to-one typing events. -->
<template>
  <div class="chat-input-root">
      <!-- Alerts — shown above input area -->
      <UAlert
        v-if="permissionDenied || errorMessage"
        color="error"
        variant="subtle"
        icon="i-ph-warning-circle-duotone"
        :title="$t('pages.messagesPage.recordPermissionTitle')"
        :description="permissionDenied ? $t('pages.messagesPage.recordPermissionDenied') : errorMessage"
        class="rounded-[18px]"
      />

      <UAlert
        v-if="locationErrorMessage"
        color="warning"
        variant="subtle"
        icon="i-ph-map-pin-line-duotone"
        :title="$t('pages.messagesPage.locationErrorTitle')"
        :description="locationErrorMessage"
        class="rounded-[18px]"
      />

      <!-- Attachment file upload panel -->
      <div v-if="attachmentPanelOpen && !recordDraft" class="chat-input-panel">
        <UFileUpload
          v-model="attachmentFile"
          :multiple="false"
          :accept="MESSAGE_ATTACHMENT_ACCEPT"
          :disabled="disabled || isRecording"
          layout="list"
          highlight
          :label="$t('pages.messagesPage.chooseFile')"
          :description="$t('uploadValidation.messageRules', { maxSize: UPLOAD_MAX_FILE_SIZE_LABEL })"
          class="w-full"
        />
      </div>

      <UAlert
        v-if="attachmentValidationMessage"
        color="error"
        variant="subtle"
        icon="i-ph-file-x-duotone"
        :title="$t('uploadValidation.title')"
        :description="attachmentValidationMessage"
        class="rounded-[var(--radius-md)]"
      />

      <UProgress
        v-if="uploadPending"
        size="xs"
        animation="carousel"
        :aria-label="$t('uploadValidation.uploading')"
      />

      <!-- Attached file preview -->
      <div v-if="attachmentFile" class="chat-input-attachment-preview">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-[var(--text-primary)]">{{ attachmentFile.name }}</p>
          <p class="text-xs text-[var(--text-secondary)]">
            {{ formatFileSize(attachmentFile.size) }}
          </p>
        </div>
        <UButton
          type="button"
          color="error"
          variant="ghost"
          icon="i-ph-x-bold"
          class="rounded-full"
          @click="clearFile"
        />
      </div>

      <!-- Recording state -->
      <div v-if="isRecording || recordDraft" class="chat-input-record-preview">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="isRecording ? 'animate-pulse bg-rose-500' : 'bg-primary-500'"
            />
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">
                {{ isRecording ? $t('pages.messagesPage.recordingInProgress') : $t('pages.messagesPage.recordReady') }}
              </p>
              <p class="text-xs text-[var(--text-secondary)]">
                {{ formattedRecordDuration }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="isRecording"
              type="button"
              color="warning"
              variant="soft"
              icon="i-ph-stop-circle-duotone"
              class="rounded-full"
              @click="stopRecordingDraft"
            >
              {{ $t("pages.messagesPage.stopRecording") }}
            </UButton>

            <template v-else-if="recordDraft">
              <UButton
                type="button"
                color="neutral"
                variant="soft"
                icon="i-ph-trash-duotone"
                class="rounded-full"
                @click="discardRecording"
              >
                {{ $t("pages.messagesPage.discardRecording") }}
              </UButton>
            </template>
          </div>
        </div>

        <audio
          v-if="recordDraft"
          :src="recordDraft.previewUrl"
          class="mt-3 w-full"
          controls
          preload="none"
        />
      </div>

      <!-- Main input row: textarea + actions -->
      <div class="chat-input-main-row">
        <div class="chat-input-field-wrap">
          <UTextarea
            v-model="modelValue"
            autoresize
            class="chat-input-textarea-control"
            :rows="1"
            :disabled="disabled"
            :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
            :ui="{
              base: 'chat-input-textarea',
            }"
            @input="handleTypingInput"
            @focus="handleTypingFocus"
            @keydown.enter.exact.prevent="handleEnterKey"
          />

          <div class="chat-input-send-wrap">
            <UTooltip :text="$t('pages.messagesPage.sendMessage')">
              <UButton
                type="button"
                variant="solid"
                icon="i-ph-paper-plane-tilt-bold"
                class="chat-input-send-button btn-primary"
                :disabled="disabled || !canSend"
                @click="submitMessage"
              />
            </UTooltip>
          </div>
        </div>

        <div class="chat-input-actions-right">
          <UTooltip :text="$t('pages.messagesPage.shareLocation')">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-ph-map-pin-line-duotone"
              class="chat-input-icon-button"
              :loading="isLocating"
              :disabled="disabled || isLocating || isRecording"
              @click="shareCurrentLocation"
            />
          </UTooltip>

          <UTooltip :text="$t('pages.messagesPage.attachmentLabel')">
            <UButton
              type="button"
              color="neutral"
              variant="soft"
              icon="i-ph-paperclip-duotone"
              class="chat-input-icon-button"
              :disabled="disabled || isRecording"
              @click="toggleAttachmentPanel"
            />
          </UTooltip>

          <UTooltip :text="isRecording ? $t('pages.messagesPage.stopRecording') : $t('pages.messagesPage.startRecording')">
            <UButton
              type="button"
              color="neutral"
              :variant="isRecording ? 'solid' : 'soft'"
              :icon="isRecording ? 'i-ph-stop-circle-duotone' : 'i-ph-microphone-duotone'"
              class="chat-input-icon-button"
              :disabled="disabled"
              @click="handleRecordButton"
            />
          </UTooltip>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useCurrentLocationShare } from "../../application/composables/useCurrentLocationShare"
import { useMessageRecorder } from "../../application/composables/useMessageRecorder"
import type { MessageComposerDraft } from "../../domain/types/messages.types"
import {
  MESSAGE_ATTACHMENT_ACCEPT,
  UPLOAD_MAX_FILE_SIZE_LABEL,
  validateMessageAttachment,
  type UploadValidationResult,
} from "../../../shared-kernel/application/utils/uploadValidation"

const modelValue = defineModel<string>({ default: "" })

const props = defineProps<{
  disabled?: boolean
  placeholder?: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  send: [value: MessageComposerDraft]
  "typing-start": []
  "typing-stop": []
}>()

const attachmentPanelOpen = ref(false)
const attachmentFile = ref<File | null>(null)
const attachmentValidationMessage = ref("")
const submittedWithUpload = ref(false)
const { t } = useI18n()

function getUploadValidationMessage(result: UploadValidationResult) {
  if (result.valid) {
    return ""
  }

  if (result.code === "too-large") {
    return t("uploadValidation.tooLarge", {
      name: result.fileName,
      maxSize: result.maxSizeLabel,
    })
  }

  if (result.code === "empty-file") {
    return t("uploadValidation.emptyFile", { name: result.fileName })
  }

  return t("uploadValidation.unsupportedType", { name: result.fileName })
}
const {
  isLocating,
  locationError,
  createCurrentLocationMessage,
  clearLocationError,
} = useCurrentLocationShare()
const {
  isSupported,
  isRecording,
  permissionDenied,
  errorMessage,
  durationMs,
  recordDraft,
  startRecording,
  stopRecording,
  clearRecording,
} = useMessageRecorder()

const canSend = computed(() =>
  modelValue.value.trim().length > 0 || Boolean(attachmentFile.value) || Boolean(recordDraft.value),
)
const uploadPending = computed(() =>
  Boolean(props.submitting && submittedWithUpload.value),
)

const formattedRecordDuration = computed(() => {
  const totalSeconds = Math.max(Math.floor(durationMs.value / 1000), 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
})

const locationErrorMessage = computed(() => {
  if (!locationError.value) {
    return ""
  }

  const keyByError = {
    unsupported: "pages.messagesPage.locationUnsupported",
    "insecure-context": "pages.messagesPage.locationInsecureContext",
    "permission-denied": "pages.messagesPage.locationPermissionDenied",
    unavailable: "pages.messagesPage.locationUnavailable",
    timeout: "pages.messagesPage.locationTimeout",
    unknown: "pages.messagesPage.locationUnknownError",
  } as const

  return t(keyByError[locationError.value])
})

watch(attachmentFile, (file) => {
  if (!file) {
    return
  }

  const validation = validateMessageAttachment(file)
  if (!validation.valid) {
    attachmentValidationMessage.value = getUploadValidationMessage(validation)
    attachmentFile.value = null
    return
  }

  attachmentValidationMessage.value = ""

  if (recordDraft.value) {
    clearRecording()
  }
})

watch(recordDraft, (draft) => {
  if (draft && attachmentFile.value) {
    attachmentFile.value = null
  }
})

watch(modelValue, (value) => {
  if (!value.trim()) {
    emit("typing-stop")
  }
})

watch(
  () => props.submitting,
  (submitting) => {
    if (!submitting) {
      submittedWithUpload.value = false
    }
  },
)

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function handleTypingFocus() {
  if (modelValue.value.trim()) {
    emit("typing-start")
  }
}

function handleTypingInput() {
  if (modelValue.value.trim()) {
    emit("typing-start")
    return
  }

  emit("typing-stop")
}

function toggleAttachmentPanel() {
  if (recordDraft.value || isRecording.value) {
    clearRecording()
  }

  attachmentPanelOpen.value = !attachmentPanelOpen.value
}

function clearFile() {
  attachmentFile.value = null
  attachmentValidationMessage.value = ""
}

async function shareCurrentLocation() {
  emit("typing-stop")
  clearLocationError()

  const messageUrl = await createCurrentLocationMessage(
    t("pages.messagesPage.locationOwnTitle"),
  )

  if (!messageUrl) {
    return
  }

  emit("send", { text: messageUrl })
}

async function handleRecordButton() {
  emit("typing-stop")

  if (isRecording.value) {
    await stopRecordingDraft()
    return
  }

  clearFile()
  attachmentPanelOpen.value = false
  await startRecording()
}

async function stopRecordingDraft() {
  await stopRecording()
}

function discardRecording() {
  clearRecording()
}

const isSubmitting = ref(false)

function handleEnterKey(event: KeyboardEvent) {
  if (event.isComposing) {
    return
  }
  submitMessage()
}

function resetComposerState() {
  modelValue.value = ""
  attachmentFile.value = null
  attachmentValidationMessage.value = ""
  attachmentPanelOpen.value = false
  clearRecording()
  emit("typing-stop")
}

function submitMessage() {
  if (!canSend.value || isSubmitting.value || props.submitting) {
    return
  }

  if (attachmentFile.value) {
    const validation = validateMessageAttachment(attachmentFile.value)
    if (!validation.valid) {
      attachmentValidationMessage.value = getUploadValidationMessage(validation)
      attachmentPanelOpen.value = true
      return
    }
  }

  isSubmitting.value = true
  submittedWithUpload.value = Boolean(attachmentFile.value || recordDraft.value)

  emit("send", {
    text: modelValue.value.trim(),
    file: attachmentFile.value,
    record: recordDraft.value,
  })

  resetComposerState()

  setTimeout(() => {
    isSubmitting.value = false
  }, 300)
}
</script>

<style scoped>
/* Root wrapper — sticky at bottom, never scrolls off */
.chat-input-root {
  flex-shrink: 0;
  border-top: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 12px 16px;
}

@media (min-width: 640px) {
  .chat-input-root {
    padding: 16px 24px;
  }
}

.chat-input-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 24px;
  border: 1px solid var(--border-light);
  background: var(--bg-surface);
  padding: 12px;
  box-shadow: var(--shadow-sm);
}

/* Main row: textarea + action buttons on the same line */
.chat-input-main-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Action buttons column — stays at bottom-right */
.chat-input-actions-right {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
}

.chat-input-icon-button {
  width: 44px !important;
  height: 44px !important;
  justify-content: center;
  border-radius: 999px !important;
}

@media (min-width: 640px) {
  .chat-input-actions-right {
    gap: 8px;
  }
}

/* Textarea wrapper */
.chat-input-field-wrap {
  position: relative;
  width: 100%;
  min-height: 46px;
  min-width: 0;
  flex: 1;
}

:deep(.chat-input-textarea-control) {
  width: 100%;
  display: block;
}

:deep(.chat-input-textarea) {
  min-height: 46px;
  width: 100%;
  border-radius: 999px !important;
  border: 1px solid var(--border-light) !important;
  background: var(--bg-muted) !important;
  padding: 11px 56px 11px 18px !important;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 24px;
  box-shadow: none !important;
  resize: none;
}

.chat-input-send-wrap {
  position: absolute;
  right: 5px;
  top: 23px;
  z-index: 2;
  transform: translateY(-50%);
}

.chat-input-send-button {
  width: 36px !important;
  height: 36px !important;
  justify-content: center;
  border-radius: 999px !important;
  box-shadow: var(--shadow-brand);
}

/* Expandable panels */
.chat-input-panel {
  border-radius: 20px;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  padding: 12px;
}

.chat-input-attachment-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  padding: 12px 16px;
}

.chat-input-record-preview {
  border-radius: 20px;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  padding: 12px 16px;
}

/* Mobile: compact action buttons */
@media (max-width: 520px) {
  .chat-input-main-row {
    gap: 6px;
  }

  .chat-input-actions-right {
    gap: 4px;
  }

  .chat-input-icon-button {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
