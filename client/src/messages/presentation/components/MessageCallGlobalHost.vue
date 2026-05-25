<!-- Description: Hosts global one-to-one message call notifications and the active LiveKit surface. -->
<template>
  <UModal v-model:open="ringingModalOpen" :ui="{ content: 'sm:max-w-[420px]' }">
    <template #body>
      <div v-if="ringingCall" class="message-call-modal">
        <UAvatar :src="ringingCall.peer.avatar" :alt="ringingCall.peer.name" size="3xl" />
        <div class="message-call-modal__copy">
          <h3>{{ ringingCall.peer.name }}</h3>
          <p>
            {{ ringingCall.direction === "incoming"
              ? (ringingCall.type === "video" ? "Cuoc goi video den" : "Cuoc goi thoai den")
              : (ringingCall.type === "video" ? "Dang goi video..." : "Dang goi thoai...") }}
          </p>
        </div>
        <div class="message-call-modal__actions">
          <UButton
            v-if="ringingCall.direction === 'incoming'"
            color="error"
            variant="soft"
            class="message-call-modal__button"
            :disabled="isCallActionPending"
            @click="declineIncomingCall"
          >
            <Icon name="i-ph-phone-disconnect-bold" />
          </UButton>
          <UButton
            v-else
            color="error"
            variant="soft"
            class="message-call-modal__button"
            :disabled="isCallActionPending"
            @click="cancelOutgoingCall"
          >
            <Icon name="i-ph-phone-disconnect-bold" />
          </UButton>
          <UButton
            v-if="ringingCall.direction === 'incoming'"
            color="success"
            class="message-call-modal__button"
            :loading="isCallActionPending"
            @click="answerIncomingCall"
          >
            <Icon :name="ringingCall.type === 'video' ? 'i-ph-video-camera-bold' : 'i-ph-phone-bold'" />
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <MessageCallOverlay
    v-if="activeCallSession"
    :session="activeCallSession"
    @ended="finishActiveCall"
  />
</template>

<script setup lang="ts">
import { useBackendWebUrl } from "../../../shared-kernel/application/utils/backend-web-url"
import { useMessageCalls } from "../../application/composables/useMessageCalls"
import MessageCallOverlay from "./MessageCallOverlay.vue"

const props = withDefaults(defineProps<{
  pollIncoming?: boolean
}>(), {
  pollIncoming: false,
})

const {
  activeSession: activeCallSession,
  answerIncomingCall,
  cancelOutgoingCall,
  declineIncomingCall,
  finishActiveCall,
  isCallActionPending,
  ringingCall,
} = useMessageCalls(undefined, { pollIncoming: computed(() => props.pollIncoming) })

const ringingModalOpen = computed({
  get: () => Boolean(ringingCall.value),
  set: (value) => {
    if (!value && ringingCall.value?.direction === "outgoing") {
      cancelOutgoingCall()
    }
  },
})

const audioCallSoundUrl = useBackendWebUrl("/themes/sunshine/mp3/calling.mp3")
const videoCallSoundUrl = useBackendWebUrl("/themes/sunshine/mp3/video_call.mp3")
let callSound: HTMLAudioElement | null = null
let pendingSoundRetry: (() => void) | null = null

function stopCallSound() {
  if (pendingSoundRetry) {
    document.removeEventListener("click", pendingSoundRetry, true)
    document.removeEventListener("touchstart", pendingSoundRetry, true)
    document.removeEventListener("keydown", pendingSoundRetry, true)
    pendingSoundRetry = null
  }

  if (callSound) {
    callSound.pause()
    callSound.currentTime = 0
    callSound = null
  }
}

function startCallSound(direction: "incoming" | "outgoing") {
  stopCallSound()

  callSound = new Audio(direction === "incoming" ? videoCallSoundUrl : audioCallSoundUrl)
  callSound.loop = true
  callSound.preload = "auto"
  callSound.volume = 0.9

  const play = () => {
    if (!callSound) {
      return
    }

    callSound.play().catch(() => {
      if (pendingSoundRetry) {
        return
      }

      pendingSoundRetry = () => {
        const retry = pendingSoundRetry
        pendingSoundRetry = null

        if (retry) {
          document.removeEventListener("click", retry, true)
          document.removeEventListener("touchstart", retry, true)
          document.removeEventListener("keydown", retry, true)
        }

        play()
      }

      document.addEventListener("click", pendingSoundRetry, true)
      document.addEventListener("touchstart", pendingSoundRetry, true)
      document.addEventListener("keydown", pendingSoundRetry, true)
    })
  }

  play()
}

watch(
  () => ringingCall.value ? `${ringingCall.value.direction}:${ringingCall.value.type}:${ringingCall.value.id}` : "",
  () => {
    if (ringingCall.value) {
      startCallSound(ringingCall.value.direction)
      return
    }

    stopCallSound()
  },
  { immediate: true },
)

watch(activeCallSession, (session) => {
  if (session) {
    stopCallSound()
  }
})

onMounted(() => {
  const audio = new Audio(audioCallSoundUrl)
  const video = new Audio(videoCallSoundUrl)
  audio.preload = "auto"
  video.preload = "auto"
})

onBeforeUnmount(() => {
  stopCallSound()
})
</script>

<style scoped>
.message-call-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 12px 0 4px;
  text-align: center;
}

.message-call-modal__copy h3 {
  max-width: 320px;
  overflow: hidden;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-call-modal__copy p {
  margin-top: 6px;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
}

.message-call-modal__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.message-call-modal__button {
  width: 58px;
  height: 58px;
  justify-content: center;
  border-radius: 999px;
  font-size: 22px;
}
</style>
