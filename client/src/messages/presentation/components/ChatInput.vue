<!-- Description: Renders the active thread composer with a PHP-style core shell for text, file, and voice note sending plus one-to-one typing events. -->
<template>
  <div class="border-t border-[var(--border-light)] bg-[#fcfdff] px-4 py-4 sm:px-6">
    <div class="rounded-[24px] border border-[var(--border-light)] bg-white p-3 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <div class="flex items-end gap-3">
        <UTooltip :text="$t('pages.messagesPage.attachmentLabel')">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-ph-paperclip-duotone"
            class="h-11 w-11 shrink-0 justify-center rounded-full"
            :disabled="disabled || isRecording"
            @click="toggleAttachmentPanel"
          />
        </UTooltip>

        <div class="min-w-0 flex-1 space-y-3">
          <UTextarea
            v-model="modelValue"
            autoresize
            :rows="1"
            :disabled="disabled"
            :placeholder="placeholder || $t('pages.messagesPage.composerPlaceholder')"
            :ui="{
              base: 'rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3 text-[15px] leading-6 shadow-none',
            }"
            @input="handleTypingInput"
            @focus="handleTypingFocus"
            @blur="emit('typing-stop')"
            @keydown.enter.exact.prevent="submitMessage"
          />

          <div v-if="attachmentPanelOpen && !recordDraft" class="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-muted)] p-3">
            <UFileUpload
              v-model="attachmentFile"
              :multiple="false"
              :disabled="disabled || isRecording"
              layout="list"
              highlight
              :label="$t('pages.messagesPage.chooseFile')"
              :description="$t('pages.messagesPage.attachmentOptional')"
              class="w-full"
            />
          </div>

          <div v-if="attachmentFile" class="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3">
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

          <div v-if="isRecording || recordDraft" class="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-muted)] px-4 py-3">
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

          <UAlert
            v-if="permissionDenied || errorMessage"
            color="error"
            variant="subtle"
            icon="i-ph-warning-circle-duotone"
            :title="$t('pages.messagesPage.recordPermissionTitle')"
            :description="permissionDenied ? $t('pages.messagesPage.recordPermissionDenied') : errorMessage"
            class="rounded-[18px]"
          />
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <UTooltip :text="isRecording ? $t('pages.messagesPage.stopRecording') : $t('pages.messagesPage.startRecording')">
            <UButton
              type="button"
              color="neutral"
              :variant="isRecording ? 'solid' : 'soft'"
              :icon="isRecording ? 'i-ph-stop-circle-duotone' : 'i-ph-microphone-duotone'"
              class="h-11 w-11 justify-center rounded-full"
              :disabled="disabled || !isSupported"
              @click="handleRecordButton"
            />
          </UTooltip>

          <UTooltip :text="$t('pages.messagesPage.sendMessage')">
            <UButton
              type="button"
              color="primary"
              variant="solid"
              icon="i-ph-paper-plane-tilt-bold"
              class="h-11 w-11 justify-center rounded-full shadow-[0_10px_24px_rgba(0,42,255,0.18)]"
              :disabled="disabled || !canSend"
              @click="submitMessage"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useMessageRecorder } from "../../application/composables/useMessageRecorder"
import type { MessageComposerDraft } from "../../domain/types/messages.types"

const modelValue = defineModel<string>({ default: "" })

defineProps<{
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [value: MessageComposerDraft]
  "typing-start": []
  "typing-stop": []
}>()

const attachmentPanelOpen = ref(false)
const attachmentFile = ref<File | null>(null)
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

const formattedRecordDuration = computed(() => {
  const totalSeconds = Math.max(Math.floor(durationMs.value / 1000), 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
})

watch(attachmentFile, (file) => {
  if (file && recordDraft.value) {
    clearRecording()
  }
})

watch(recordDraft, (draft) => {
  if (draft && attachmentFile.value) {
    attachmentFile.value = null
  }
})

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

function resetComposerState() {
  modelValue.value = ""
  attachmentFile.value = null
  attachmentPanelOpen.value = false
  clearRecording()
  emit("typing-stop")
}

function submitMessage() {
  if (!canSend.value) {
    return
  }

  emit("send", {
    text: modelValue.value.trim(),
    file: attachmentFile.value,
    record: recordDraft.value,
  })

  resetComposerState()
}
</script>
