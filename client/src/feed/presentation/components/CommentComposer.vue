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
            class="w-full"
            :disabled="submitting"
            :ui="{
              base: 'min-h-[44px] resize-none rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--bg-surface-hover)] py-3 pl-4 pr-12 text-[var(--text-body)] leading-5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:bg-[var(--bg-surface)] focus:ring-2 focus:ring-[var(--color-primary-100)]',
            }"
            @keydown.enter.exact.prevent="submitComment"
          />

          <button
            type="submit"
            class="comment-composer__send"
            :disabled="submitting || !canSubmit"
            :aria-label="$t('feed.commentComposer.submit')"
          >
            <Icon v-if="submitting" name="i-ph-circle-notch-bold" class="h-4 w-4 animate-spin" />
            <Icon v-else name="i-ph-paper-plane-tilt-fill" class="h-4 w-4" />
          </button>
        </div>

        <div v-if="attachmentPreview || recording || recordingErrorMessage" class="comment-composer__preview">
          <template v-if="recording">
            <div class="comment-composer__recording-status">
              <span class="comment-composer__recording-dot" />
              <span class="comment-composer__preview-label">{{ $t("feed.commentComposer.recording") }}</span>
              <span class="comment-composer__recording-time">{{ recordingDurationLabel }}</span>
            </div>
            <div class="comment-composer__recording-progress" aria-hidden="true">
              <span class="comment-composer__recording-progress-bar" />
            </div>
          </template>

          <template v-else-if="attachmentPreview?.type === 'audio'">
            <div class="comment-composer__audio-preview">
              <audio
                ref="audioPreviewRef"
                :src="attachmentPreview.url"
                preload="metadata"
                class="comment-composer__audio-native"
                @loadedmetadata="syncAudioPreview"
                @timeupdate="syncAudioPreview"
                @ended="stopAudioPreview"
              />

              <button
                class="comment-composer__audio-toggle"
                type="button"
                :aria-label="audioPlaying ? 'Stop voice preview' : 'Play voice preview'"
                @click="toggleAudioPreview"
              >
                <Icon :name="audioPlaying ? 'i-ph-stop-fill' : 'i-ph-play-fill'" class="h-4 w-4" />
              </button>

              <div class="comment-composer__audio-track">
                <div class="comment-composer__audio-meta">
                  <span class="comment-composer__preview-label">
                    {{ attachmentPreview.name || $t("feed.commentComposer.tooltipVoice") }}
                  </span>
                  <span class="comment-composer__recording-time">{{ audioProgressLabel }}</span>
                </div>
                <div class="comment-composer__audio-progress" aria-hidden="true">
                  <span class="comment-composer__audio-progress-bar" :style="{ width: `${audioProgressPercent}%` }" />
                </div>
              </div>

              <button
                class="comment-composer__preview-remove"
                type="button"
                :aria-label="$t('feed.commentComposer.removeAttachment')"
                @click="clearAttachment"
              >
                <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
              </button>
            </div>
          </template>

          <template v-else>
            <div class="comment-composer__preview-meta">
              <span class="comment-composer__preview-label">
                {{
                  recordingErrorMessage || attachmentPreview?.name || $t("feed.commentComposer.selectedAttachment")
                }}
              </span>
              <button
                v-if="attachmentPreview || recordingErrorMessage"
                class="comment-composer__preview-remove"
                type="button"
                :aria-label="$t('feed.commentComposer.removeAttachment')"
                @click="clearAttachment"
              >
                <Icon name="i-ph-x-bold" class="h-3.5 w-3.5" />
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="comment-composer__toolbar">
        <div class="comment-composer__tools">
          <button
            v-if="enableAttachments"
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
            v-if="enableAttachments"
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
            v-if="enableAttachments"
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
        v-if="enableAttachments"
        ref="imageInputRef"
        class="comment-composer__file"
        type="file"
        accept="image/png,image/jpeg,image/gif"
        @change="selectImageFile"
      >
      <input
        v-if="enableAttachments"
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
  enableAttachments?: boolean
}>(), {
  currentUserName: "",
  currentUserAvatarUrl: "",
  submitting: false,
  enableAttachments: true,
})

const emit = defineEmits<{
  submit: [payload: FeedCommentSubmitPayload]
}>()
const { t } = useI18n()
const toast = useToast()

const emojiOptions = ["😀", "😄", "😍", "😂", "😮", "😢", "😡", "👍", "❤️"]
const message = ref("")
const emojiOpen = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)
const gifInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref()
const audioPreviewRef = ref<HTMLAudioElement | null>(null)
const imageFile = ref<File | undefined>()
const gifFile = ref<File | undefined>()
const audioFile = ref<File | undefined>()
const attachmentPreview = ref<FeedCommentAttachment | undefined>()
const recording = ref(false)
const recordingErrorMessage = ref("")
const audioPlaying = ref(false)
const audioCurrentTime = ref(0)
const audioDuration = ref(0)
const mediaStream = ref<MediaStream | null>(null)
const audioContext = ref<AudioContext | null>(null)
const mediaSource = ref<MediaStreamAudioSourceNode | null>(null)
const scriptProcessor = ref<ScriptProcessorNode | null>(null)
const pcmChunks = ref<Float32Array[]>([])
const recordingSampleRate = ref(44100)
const recordingStartedAt = ref<number | null>(null)
const recordingElapsedMs = ref(0)
let recordingTimer: ReturnType<typeof setInterval> | null = null

const trimmedMessage = computed(() => message.value.trim())
const canSubmit = computed(() =>
  Boolean(trimmedMessage.value || (props.enableAttachments && (imageFile.value || gifFile.value || audioFile.value))),
)
const recordingDurationLabel = computed(() => formatRecordingDuration(recordingElapsedMs.value))
const audioProgressPercent = computed(() => {
  if (!audioDuration.value) {
    return 0
  }

  return Math.min(100, Math.max(0, (audioCurrentTime.value / audioDuration.value) * 100))
})
const audioProgressLabel = computed(() => {
  const current = formatRecordingDuration(audioCurrentTime.value * 1000)
  const duration = formatRecordingDuration(audioDuration.value * 1000)

  return `${current} / ${duration}`
})
const canRecordAudio = computed(() => {
  if (!import.meta.client) {
    return false
  }

  return Boolean(
    navigator.mediaDevices?.getUserMedia
    && typeof AudioContext !== "undefined",
  )
})

const currentUserInitials = computed(() => {
  const value = props.currentUserName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return value
})

function revokeAttachmentUrl() {
  if (attachmentPreview.value?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(attachmentPreview.value.url)
  }
}

function resetFileInputs() {
  if (imageInputRef.value) imageInputRef.value.value = ""
  if (gifInputRef.value) gifInputRef.value.value = ""
}

function resetAudioPreviewState() {
  if (audioPreviewRef.value) {
    audioPreviewRef.value.pause()
    audioPreviewRef.value.currentTime = 0
  }

  audioPlaying.value = false
  audioCurrentTime.value = 0
  audioDuration.value = 0
}

function resetComposerState() {
  resetAudioPreviewState()
  revokeAttachmentUrl()
  imageFile.value = undefined
  gifFile.value = undefined
  audioFile.value = undefined
  attachmentPreview.value = undefined
  recordingErrorMessage.value = ""
  resetFileInputs()
}

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
  resetComposerState()
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

function setAudioAttachment(file: File) {
  resetComposerState()
  const previewUrl = URL.createObjectURL(file)

  audioFile.value = file
  attachmentPreview.value = {
    type: "audio",
    url: previewUrl,
    name: file.name,
  }
}

function clearAttachment() {
  resetComposerState()
}

function insertEmoji(emoji: string) {
  message.value = `${message.value}${emoji}`
  emojiOpen.value = false
  nextTick(() => {
    const textarea = textareaRef.value?.$el?.querySelector?.("textarea") as HTMLTextAreaElement | null
    textarea?.focus()
  })
}

function syncAudioPreview() {
  const audio = audioPreviewRef.value

  if (!audio) {
    return
  }

  audioCurrentTime.value = audio.currentTime || 0
  audioDuration.value = Number.isFinite(audio.duration) ? audio.duration : 0
}

function stopAudioPreview() {
  if (audioPreviewRef.value) {
    audioPreviewRef.value.pause()
    audioPreviewRef.value.currentTime = 0
  }

  audioPlaying.value = false
  audioCurrentTime.value = 0
}

async function toggleAudioPreview() {
  const audio = audioPreviewRef.value

  if (!audio) {
    return
  }

  if (audioPlaying.value) {
    stopAudioPreview()
    return
  }

  try {
    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
      audio.load()
    }

    audioPlaying.value = true
    await audio.play()
    syncAudioPreview()
  }
  catch {
    audioPlaying.value = false
  }
}

function stopMediaStream() {
  stopRecordingTimer()
  scriptProcessor.value?.disconnect()
  mediaSource.value?.disconnect()
  void audioContext.value?.close()
  scriptProcessor.value = null
  mediaSource.value = null
  audioContext.value = null
  mediaStream.value?.getTracks().forEach(track => track.stop())
  mediaStream.value = null
}

function formatRecordingDuration(value: number) {
  const totalSeconds = Math.max(0, Math.floor(value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

function startRecordingTimer() {
  stopRecordingTimer()
  recordingStartedAt.value = Date.now()
  recordingElapsedMs.value = 0
  recordingTimer = setInterval(() => {
    if (!recordingStartedAt.value) {
      return
    }

    recordingElapsedMs.value = Date.now() - recordingStartedAt.value
  }, 200)
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }

  recordingStartedAt.value = null
}

function mergeFloat32Chunks(chunks: Float32Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const merged = new Float32Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  return merged
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
    offset += 2
  }

  return new Blob([buffer], { type: "audio/wav" })
}

function createAudioFileFromChunks() {
  const merged = mergeFloat32Chunks(pcmChunks.value)
  const blob = encodeWav(merged, recordingSampleRate.value)

  return new File([blob], `comment-audio-${Date.now()}.wav`, { type: "audio/wav" })
}

async function toggleRecording() {
  if (recording.value) {
    if (pcmChunks.value.length > 0) {
      setAudioAttachment(createAudioFileFromChunks())
    }

    recording.value = false
    stopMediaStream()
    return
  }

  if (!import.meta.client) {
    return
  }

  try {
    if (!canRecordAudio.value) {
      recordingErrorMessage.value = t("feed.commentComposer.microphoneUnavailable")
      toast.add({
        color: "warning",
        icon: "i-ph-warning-circle-fill",
        title: t("feed.commentComposer.tooltipVoice"),
        description: t("feed.commentComposer.microphoneUnavailable"),
      })
      return
    }

    resetComposerState()
    pcmChunks.value = []
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
    audioContext.value = new AudioContext()
    recordingSampleRate.value = audioContext.value.sampleRate
    mediaSource.value = audioContext.value.createMediaStreamSource(mediaStream.value)
    scriptProcessor.value = audioContext.value.createScriptProcessor(4096, 1, 1)

    scriptProcessor.value.onaudioprocess = (event) => {
      if (!recording.value) {
        return
      }

      const channelData = event.inputBuffer.getChannelData(0)
      pcmChunks.value.push(new Float32Array(channelData))
    }

    mediaSource.value.connect(scriptProcessor.value)
    scriptProcessor.value.connect(audioContext.value.destination)
    recording.value = true
    startRecordingTimer()
  }
  catch (error) {
    const message = error instanceof Error && error.name === "NotAllowedError"
      ? t("feed.commentComposer.microphonePermissionDenied")
      : t("feed.commentComposer.microphoneUnavailable")

    recordingErrorMessage.value = message
    toast.add({
      color: "warning",
      icon: "i-ph-warning-circle-fill",
      title: t("feed.commentComposer.tooltipVoice"),
      description: message,
    })
    recording.value = false
    stopMediaStream()
  }
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
  emojiOpen.value = false
  resetComposerState()
}

onBeforeUnmount(() => {
  revokeAttachmentUrl()
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
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--bg-surface-hover);
  padding: 10px 12px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.comment-composer__preview-meta,
.comment-composer__recording-status,
.comment-composer__audio-preview {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.comment-composer__preview-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-composer__recording-time {
  flex-shrink: 0;
  color: var(--text-tertiary);
  font-variant-numeric: tabular-nums;
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

.comment-composer__audio-preview {
  color-scheme: light;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  background: var(--bg-surface);
  padding: var(--space-2);
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}

.comment-composer__audio-native {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.comment-composer__audio-toggle {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  color: var(--icon-inverse);
  cursor: pointer;
  box-shadow: var(--shadow-brand);
  transition: transform var(--duration-fast) var(--ease-default), background var(--duration-fast) var(--ease-default);
}

.comment-composer__audio-toggle:hover {
  background: var(--bg-brand-hover);
  transform: translateY(-1px);
}

.comment-composer__audio-track {
  min-width: 0;
  flex: 1;
}

.comment-composer__audio-meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-2);
}

.comment-composer__audio-progress {
  width: 100%;
  height: 6px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--bg-surface-active);
}

.comment-composer__audio-progress-bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--bg-brand);
  transition: width var(--duration-fast) linear;
}

.comment-composer__recording-progress {
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--bg-surface-active);
}

.comment-composer__recording-progress-bar {
  display: block;
  width: 36%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary-400) 0%, var(--color-primary-600) 100%);
  animation: comment-recording-progress 1.2s ease-in-out infinite;
}

.comment-composer__recording-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-error);
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
  top: 6px;
  right: 6px;
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--bg-brand);
  color: var(--icon-inverse);
  cursor: pointer;
  box-shadow: var(--shadow-brand);
  transition: transform var(--duration-fast) var(--ease-default), box-shadow var(--duration-fast) var(--ease-default), opacity var(--duration-fast) var(--ease-default);
}

.comment-composer__send:hover:not(:disabled) {
  background: var(--bg-brand-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-xl);
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

@keyframes comment-recording-progress {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(280%);
  }
}
</style>
