// English description: Manages browser-side audio recording, timer state, and replayable message record drafts for the messages context.

import { computed, onBeforeUnmount, ref, shallowRef } from "vue"
import type { MessageRecordDraft } from "../../domain/types/messages.types"

const writeWavString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

function encodeAudioBufferAsWav(audioBuffer: AudioBuffer) {
  const channelCount = Math.min(Math.max(audioBuffer.numberOfChannels, 1), 2)
  const bytesPerSample = 2
  const frameCount = audioBuffer.length
  const dataLength = frameCount * channelCount * bytesPerSample
  const wavBuffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(wavBuffer)

  writeWavString(view, 0, "RIFF")
  view.setUint32(4, 36 + dataLength, true)
  writeWavString(view, 8, "WAVE")
  writeWavString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, audioBuffer.sampleRate, true)
  view.setUint32(28, audioBuffer.sampleRate * channelCount * bytesPerSample, true)
  view.setUint16(32, channelCount * bytesPerSample, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeWavString(view, 36, "data")
  view.setUint32(40, dataLength, true)

  const channels = Array.from(
    { length: channelCount },
    (_, channel) => audioBuffer.getChannelData(channel),
  )
  let offset = 44

  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel]?.[frame] ?? 0))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += bytesPerSample
    }
  }

  return wavBuffer
}

async function convertRecordingToWav(blob: Blob) {
  const audioContext = new AudioContext()

  try {
    const audioBuffer = await audioContext.decodeAudioData(await blob.arrayBuffer())
    return new Blob([encodeAudioBufferAsWav(audioBuffer)], { type: "audio/wav" })
  }
  finally {
    await audioContext.close()
  }
}

export function useMessageRecorder() {
  const mediaRecorder = shallowRef<MediaRecorder | null>(null)
  const mediaStream = shallowRef<MediaStream | null>(null)
  const chunks = shallowRef<BlobPart[]>([])
  const discardOnStop = ref(false)
  const timerId = shallowRef<ReturnType<typeof window.setInterval> | null>(null)
  const startedAt = ref(0)
  const durationMs = ref(0)
  const isRecording = ref(false)
  const permissionDenied = ref(false)
  const errorMessage = ref("")
  const recordDraft = ref<MessageRecordDraft | null>(null)
  let recordingSessionId = 0

  const isSupported = computed(() =>
    import.meta.client
    && typeof window !== "undefined"
    && typeof navigator !== "undefined"
    && typeof navigator.mediaDevices?.getUserMedia === "function"
    && typeof window.MediaRecorder !== "undefined",
  )

  const clearTimer = () => {
    if (import.meta.client && timerId.value) {
      window.clearInterval(timerId.value)
      timerId.value = null
    }
  }

  const stopStream = () => {
    mediaStream.value?.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }

  const clearRecording = () => {
    recordingSessionId += 1
    clearTimer()

    const recorder = mediaRecorder.value
    if (recorder && recorder.state !== "inactive") {
      discardOnStop.value = true
      recorder.stop()
      isRecording.value = false
    }
    stopStream()

    if (recordDraft.value?.previewUrl) {
      URL.revokeObjectURL(recordDraft.value.previewUrl)
    }

    recordDraft.value = null
    durationMs.value = 0
    startedAt.value = 0
    errorMessage.value = ""
    permissionDenied.value = false
  }

  const stopRecording = async () => {
    if (!mediaRecorder.value || mediaRecorder.value.state === "inactive") {
      return
    }

    await new Promise<void>((resolve) => {
      const recorder = mediaRecorder.value

      if (!recorder) {
        resolve()
        return
      }

      recorder.addEventListener("stop", () => resolve(), { once: true })
      recorder.stop()
    })
  }

  const startRecording = async () => {
    if (!isSupported.value) {
      permissionDenied.value = false
      errorMessage.value = "Trinh duyet hoac ket noi hien tai khong ho tro ghi am."
      return false
    }

    if (isRecording.value) {
      return false
    }

    clearRecording()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const sessionId = ++recordingSessionId
      mediaStream.value = stream
      const recorder = new MediaRecorder(stream)
      chunks.value = []
      errorMessage.value = ""
      permissionDenied.value = false

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.value.push(event.data)
        }
      })

      recorder.addEventListener("stop", async () => {
        clearTimer()
        isRecording.value = false

        if (mediaRecorder.value === recorder) {
          mediaRecorder.value = null
        }

        if (discardOnStop.value) {
          discardOnStop.value = false
          chunks.value = []
          stopStream()
          return
        }

        const mimeType = recorder.mimeType || "audio/webm"
        const finalDurationMs = durationMs.value || Math.max(Date.now() - startedAt.value, 0)
        const sourceBlob = new Blob(chunks.value, { type: mimeType })

        try {
          const blob = await convertRecordingToWav(sourceBlob)

          if (sessionId !== recordingSessionId) {
            return
          }

          const previewUrl = URL.createObjectURL(blob)

          recordDraft.value = {
            blob,
            fileName: `record-${Date.now()}.wav`,
            mimeType: "audio/wav",
            durationMs: finalDurationMs,
            previewUrl,
          }
        }
        catch (error) {
          if (sessionId === recordingSessionId) {
            errorMessage.value = error instanceof Error
              ? error.message
              : "Unable to prepare the recording for sending."
          }
        }

        stopStream()
      })

      mediaRecorder.value = recorder
      discardOnStop.value = false
      startedAt.value = Date.now()
      durationMs.value = 0
      isRecording.value = true
      recorder.start()

      timerId.value = window.setInterval(() => {
        durationMs.value = Math.max(Date.now() - startedAt.value, 0)
      }, 200)

      return true
    }
    catch (error) {
      permissionDenied.value = true
      isRecording.value = false
      stopStream()
      clearTimer()
      errorMessage.value = error instanceof Error
        ? error.message
        : "Unable to access the microphone."
      return false
    }
  }

  onBeforeUnmount(() => {
    clearRecording()
  })

  return {
    isSupported,
    isRecording,
    permissionDenied,
    errorMessage,
    durationMs,
    recordDraft,
    startRecording,
    stopRecording,
    clearRecording,
  }
}
