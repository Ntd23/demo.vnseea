<!-- Description: Provides the PHP-parity feed comment composer with real text, image, GIF-file, and voice submit payloads. -->
<template>
  <form class="comment-composer" @submit.prevent="submitComment">
    <div class="comment-composer__avatar" aria-hidden="true">
      <img
        v-if="currentUserAvatarUrl"
        :src="currentUserAvatarUrl"
        :alt="currentUserName"
        class="comment-composer__avatar-img"
      >
      <span v-else-if="currentUserInitials">{{ currentUserInitials }}</span>
      <Icon v-else name="i-ph-user-circle-fill" class="h-5 w-5" />
    </div>

    <div class="comment-composer__shell">
      <div class="comment-composer__field">
        <div class="comment-composer__input-wrap">
          <UTextarea
            ref="textareaRef"
            v-model="message"
            autoresize
            :rows="1"
            :placeholder="$t('feed.commentComposer.placeholder')"
            class="w-full"
            :disabled="submitting"
            :ui="{
              base: 'min-h-[44px] resize-none rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-surface-hover)] py-3 pl-4 pr-12 text-[14px] leading-5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
            }"
            @keydown.enter.exact.prevent="submitComment"
          />

          <button
            type="submit"
            class="btn-primary comment-composer__send"
            :disabled="submitting || !canSubmit"
            :aria-label="$t('feed.commentComposer.submit')"
          >
            <Icon v-if="submitting" name="i-ph-circle-notch-bold" class="h-4 w-4 animate-spin" />
            <Icon v-else name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="attachmentPreview || recording" class="comment-composer__preview">
          <span v-if="recording" class="comment-composer__recording-dot" />
          <span class="comment-composer__preview-label">
            {{ recording ? $t("feed.commentComposer.recording") : attachmentPreview?.name || $t("feed.commentComposer.selectedAttachment") }}
          </span>
          <button
            v-if="attachmentPreview"
            class="comment-composer__preview-remove"
            type="button"
            :aria-label="$t('feed.commentComposer.removeAttachment')"
            @click="clearAttachment"
          >
            <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div class="comment-composer__toolbar">
        <div class="comment-composer__tools">
          <button
            class="comment-composer__tool"
            type="button"
            :title="$t('feed.commentComposer.tooltipGif')"
            :aria-label="$t('feed.commentComposer.tooltipGif')"
            :disabled="submitting"
            @click="openGifPicker"
          >
            {{ $t("feed.commentComposer.tooltipGif") }}
          </button>
          <div class="comment-composer__emoji-wrap">
            <button
              class="comment-composer__tool"
              type="button"
              :title="$t('feed.commentComposer.tooltipEmoji')"
              :aria-label="$t('feed.commentComposer.tooltipEmoji')"
              :disabled="submitting"
              @click="emojiOpen = !emojiOpen"
            >
              <Icon name="i-ph-smiley-duotone" class="h-5 w-5" />
            </button>
            <div v-if="emojiOpen" class="comment-composer__emoji-tray">
              <button
                v-for="emoji in emojiOptions"
                :key="emoji"
                class="comment-composer__emoji"
                type="button"
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          <button
            class="comment-composer__tool"
            type="button"
            :title="$t('feed.commentComposer.tooltipImage')"
            :aria-label="$t('feed.commentComposer.tooltipImage')"
            :disabled="submitting"
            @click="openImagePicker"
          >
            <Icon name="i-ph-images-square-duotone" class="h-5 w-5" />
          </button>
          <button
            class="comment-composer__tool"
            :class="{ 'comment-composer__tool--recording': recording }"
            type="button"
            :title="$t('feed.commentComposer.tooltipVoice')"
            :aria-label="$t('feed.commentComposer.tooltipVoice')"
            :disabled="submitting"
            @click="toggleRecording"
          >
            <Icon :name="recording ? 'i-ph-stop-circle-fill' : 'i-ph-microphone-duotone'" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <input
        ref="imageInputRef"
        class="comment-composer__file"
        type="file"
        accept="image/png,image/jpeg,image/gif"
        @change="selectImageFile"
      >
      <input
        ref="gifInputRef"
        class="comment-composer__file"
        type="file"
        accept="image/gif"
        @change="selectGifFile"
      >
    </div>
  </form>
</template>

<script setup lang="ts">
import type { FeedCommentAttachment, FeedCommentSubmitPayload } from "../../domain/types/feed.types"

const props = withDefaults(defineProps<{
  currentUserName?: string
  currentUserAvatarUrl?: string
  submitting?: boolean
}>(), {
  currentUserName: "",
  currentUserAvatarUrl: "",
  submitting: false,
})

const emit = defineEmits<{
  submit: [payload: FeedCommentSubmitPayload]
}>()

const emojiOptions = ["😀", "😄", "😍", "😂", "😮", "😢", "😡", "👍", "❤️"]
const message = ref("")
const emojiOpen = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)
const gifInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref()
const imageFile = ref<File | undefined>()
const gifFile = ref<File | undefined>()
const audioFile = ref<File | undefined>()
const attachmentPreview = ref<FeedCommentAttachment | undefined>()
const recording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const audioChunks = ref<Blob[]>([])

const trimmedMessage = computed(() => message.value.trim())
const canSubmit = computed(() =>
  Boolean(trimmedMessage.value || imageFile.value || gifFile.value || audioFile.value),
)
const currentUserInitials = computed(() => {
  const value = props.currentUserName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return value
})

function openImagePicker() {
  imageInputRef.value?.click()
}

function openGifPicker() {
  gifInputRef.value?.click()
}

function selectImageFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) {
    return
  }

  setAttachment(file, file.type === "image/gif" ? "gif" : "image")
}

function selectGifFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]

  if (!file) {
    return
  }

  setAttachment(file, "gif")
}

function setAttachment(file: File, type: FeedCommentAttachment["type"]) {
  clearAttachment()
  const previewUrl = URL.createObjectURL(file)

  attachmentPreview.value = {
    type,
    url: previewUrl,
    name: file.name,
  }

  if (type === "gif") {
    gifFile.value = file
  }
  else {
    imageFile.value = file
  }
}

function clearAttachment() {
  if (attachmentPreview.value?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(attachmentPreview.value.url)
  }

  imageFile.value = undefined
  gifFile.value = undefined
  audioFile.value = undefined
  attachmentPreview.value = undefined

  if (imageInputRef.value) imageInputRef.value.value = ""
  if (gifInputRef.value) gifInputRef.value.value = ""
}

function insertEmoji(emoji: string) {
  message.value = `${message.value}${emoji}`
  emojiOpen.value = false
  nextTick(() => {
    const textarea = textareaRef.value?.$el?.querySelector?.("textarea") as HTMLTextAreaElement | null
    textarea?.focus()
  })
}

async function toggleRecording() {
  if (recording.value) {
    mediaRecorder.value?.stop()
    return
  }

  if (!import.meta.client || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    return
  }

  clearAttachment()
  audioChunks.value = []
  mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder.value = new MediaRecorder(mediaStream.value)
  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.value.push(event.data)
    }
  }
  mediaRecorder.value.onstop = () => {
    const mimeType = mediaRecorder.value?.mimeType || "audio/webm"
    const blob = new Blob(audioChunks.value, { type: mimeType })
    const extension = mimeType.includes("wav") ? "wav" : "webm"
    const file = new File([blob], `comment-audio-${Date.now()}.${extension}`, { type: mimeType })
    const previewUrl = URL.createObjectURL(file)

    audioFile.value = file
    attachmentPreview.value = {
      type: "audio",
      url: previewUrl,
      name: file.name,
    }
    recording.value = false
    stopMediaStream()
  }
  mediaRecorder.value.start()
  recording.value = true
}

function stopMediaStream() {
  mediaStream.value?.getTracks().forEach(track => track.stop())
  mediaStream.value = null
  mediaRecorder.value = null
}

function submitComment() {
  if (!canSubmit.value || props.submitting) {
    return
  }

  emit("submit", {
    text: trimmedMessage.value,
    imageFile: imageFile.value,
    gifFile: gifFile.value,
    audioFile: audioFile.value,
    attachmentPreview: attachmentPreview.value,
  })
  message.value = ""
  imageFile.value = undefined
  gifFile.value = undefined
  audioFile.value = undefined
  attachmentPreview.value = undefined
  emojiOpen.value = false
  if (imageInputRef.value) imageInputRef.value.value = ""
  if (gifInputRef.value) gifInputRef.value.value = ""
}

onBeforeUnmount(() => {
  stopMediaStream()
})
</script>

<style scoped>
.comment-composer {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.comment-composer__avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--bg-surface-active);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
}

.comment-composer__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-composer__shell {
  min-width: 0;
  flex: 1;
}

.comment-composer__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-composer__input-wrap {
  position: relative;
}

.comment-composer__preview {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--bg-surface-hover);
  padding: 5px 8px 5px 10px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.comment-composer__preview-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-composer__preview-remove {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  color: var(--text-tertiary);
  cursor: pointer;
}

.comment-composer__recording-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: #ef4444;
  animation: comment-recording-pulse 1s ease-in-out infinite;
}

.comment-composer__toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 7px;
}

.comment-composer__tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.comment-composer__tool {
  position: relative;
  display: inline-flex;
  min-width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.comment-composer__tool:hover,
.comment-composer__tool--recording {
  background: var(--bg-surface-active);
  color: var(--text-brand);
}

.comment-composer__tool:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.comment-composer__emoji-wrap {
  position: relative;
}

.comment-composer__emoji-tray {
  position: absolute;
  left: 0;
  bottom: calc(100% + 8px);
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(5, 30px);
  gap: 4px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 8px;
  box-shadow: var(--shadow-lg);
}

.comment-composer__emoji {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
}

.comment-composer__emoji:hover {
  background: var(--bg-surface-hover);
}

.comment-composer__send {
  position: absolute;
  top: 5px;
  right: 6px;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #2233ff 0%, #0000ff 100%);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 255, 0.2);
  transition: all 0.15s ease;
}

.comment-composer__send:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

.comment-composer__file {
  display: none;
}

@keyframes comment-recording-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}
</style>
