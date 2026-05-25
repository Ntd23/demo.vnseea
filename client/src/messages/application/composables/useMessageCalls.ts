// Description: Coordinates one-to-one message call state, PHP call polling, and LiveKit sessions.

import type { Ref } from "vue"
import type {
  MessageCallSession,
  MessageCallStatus,
  MessageCallType,
} from "../../domain/types/calls.types"
import type { MessageContact } from "../../domain/types/messages.types"
import { createApiMessageCallsRepository } from "../../infrastructure/repositories/ApiMessageCallsRepository"

type RingingCall = {
  id: number
  type: MessageCallType
  direction: "incoming" | "outgoing"
  peer: {
    name: string
    avatar?: string
  }
}

type MessageCallOptions = {
  pollIncoming?: boolean | Ref<boolean>
}

const POLL_INTERVAL_MS = 2000
const NO_ANSWER_MS = 43000
let outgoingPoll: ReturnType<typeof setInterval> | null = null
let incomingPoll: ReturnType<typeof setInterval> | null = null
let noAnswerTimer: ReturnType<typeof setTimeout> | null = null

export function useMessageCalls(
  repository = createApiMessageCallsRepository(),
  options: MessageCallOptions = {},
) {
  const ringingCall = useState<RingingCall | null>("messages:call:ringing", () => null)
  const activeSession = useState<MessageCallSession | null>("messages:call:active", () => null)
  const status = useState<MessageCallStatus>("messages:call:status", () => "idle")
  const errorMessage = useState("messages:call:error", () => "")
  const isCallActionPending = useState("messages:call:pending", () => false)
  const shouldPollIncoming = computed(() =>
    typeof options.pollIncoming === "object"
      ? Boolean(options.pollIncoming.value)
      : Boolean(options.pollIncoming),
  )

  const clearOutgoingTimers = () => {
    if (outgoingPoll) {
      clearInterval(outgoingPoll)
      outgoingPoll = null
    }
    if (noAnswerTimer) {
      clearTimeout(noAnswerTimer)
      noAnswerTimer = null
    }
  }

  const resetRinging = () => {
    clearOutgoingTimers()
    ringingCall.value = null
    if (!activeSession.value) {
      status.value = "idle"
    }
  }

  const endBackendCall = async (input: { id: number, type: MessageCallType, status: string, duration?: number }) => {
    await repository.endCall(input).catch(() => null)
  }

  const fetchPayload = async (id: number, type: MessageCallType) => {
    status.value = "connecting"
    const session = await repository.getSessionPayload({ id, type })
    activeSession.value = session
    ringingCall.value = null
    status.value = "active"
  }

  const pollOutgoingAnswer = (id: number, type: MessageCallType) => {
    clearOutgoingTimers()
    outgoingPoll = setInterval(async () => {
      const result = await repository.getOutgoingStatus({ id, type }).catch(() => null)

      if (!result) {
        return
      }

      if (result.status === 200) {
        clearOutgoingTimers()
        await fetchPayload(id, type).catch((error) => {
          errorMessage.value = error?.statusMessage || "Can not join call."
          status.value = "error"
        })
      }
      else if (result.status === 400) {
        clearOutgoingTimers()
        ringingCall.value = null
        status.value = "declined"
      }
    }, POLL_INTERVAL_MS)

    noAnswerTimer = setTimeout(async () => {
      clearOutgoingTimers()
      await endBackendCall({ id, type, status: "no_answer" })
      ringingCall.value = null
      status.value = "no_answer"
    }, NO_ANSWER_MS)
  }

  const startCall = async (contact: MessageContact, type: MessageCallType) => {
    if (!contact.userId || isCallActionPending.value || ringingCall.value || activeSession.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""

    try {
      const result = await repository.createCall({
        userId: contact.userId,
        type,
      })

      if (result.busy || result.id <= 0) {
        status.value = "busy"
        errorMessage.value = result.message || "Recipient is busy."
        return
      }

      status.value = "ringing"
      ringingCall.value = {
        id: result.id,
        type,
        direction: "outgoing",
        peer: {
          name: contact.name,
          avatar: contact.avatarUrl,
        },
      }
      pollOutgoingAnswer(result.id, type)
    }
    catch (error: any) {
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not start call."
    }
    finally {
      isCallActionPending.value = false
    }
  }

  const answerIncomingCall = async () => {
    const call = ringingCall.value

    if (!call || call.direction !== "incoming" || isCallActionPending.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""

    try {
      status.value = "connecting"
      const session = await repository.answerCall({
        id: call.id,
        type: call.type,
      })
      activeSession.value = session
      ringingCall.value = null
      status.value = "active"
    }
    catch (error: any) {
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not answer call."
    }
    finally {
      isCallActionPending.value = false
    }
  }

  const declineIncomingCall = async () => {
    const call = ringingCall.value

    if (!call) {
      return
    }

    clearOutgoingTimers()
    await repository.declineCall({
      id: call.id,
      type: call.type,
    }).catch(() => null)
    ringingCall.value = null
    status.value = "declined"
  }

  const cancelOutgoingCall = async () => {
    const call = ringingCall.value

    if (!call) {
      return
    }

    clearOutgoingTimers()
    await endBackendCall({ id: call.id, type: call.type, status: "cancelled" })
    ringingCall.value = null
    status.value = "idle"
  }

  const finishActiveCall = async (duration = 0) => {
    const session = activeSession.value

    if (!session) {
      return
    }

    await endBackendCall({
      id: session.id,
      type: session.type,
      status: "ended",
      duration,
    })
    activeSession.value = null
    status.value = "ended"
  }

  const pollIncoming = async (type: MessageCallType) => {
    if (ringingCall.value || activeSession.value) {
      return
    }

    const incoming = await repository.getIncomingCall(type).catch(() => null)

    if (!incoming?.id) {
      return
    }

    ringingCall.value = {
      id: incoming.id,
      type: incoming.type,
      direction: "incoming",
      peer: {
        name: incoming.peer.name,
        avatar: incoming.peer.avatar,
      },
    }
    status.value = "ringing"
  }

  const validateCurrentIncomingCall = async () => {
    const call = ringingCall.value

    if (!call || call.direction !== "incoming") {
      return false
    }

    const incoming = await repository.getIncomingCall(call.type).catch(() => null)

    if (activeSession.value) {
      return true
    }

    if (!incoming || incoming.id !== call.id) {
      ringingCall.value = null
      status.value = "idle"
      return false
    }

    return true
  }

  const pollIncomingTypes = async () => {
    if (activeSession.value) {
      return
    }

    if (ringingCall.value?.direction === "incoming") {
      const stillRinging = await validateCurrentIncomingCall()
      if (stillRinging) {
        return
      }
    }

    if (ringingCall.value) {
      return
    }

    await pollIncoming("video")
    await pollIncoming("audio")
  }

  const startIncomingPolling = () => {
    if (!import.meta.client) {
      return
    }
    if (incomingPoll) {
      return
    }
    pollIncomingTypes()
    incomingPoll = setInterval(() => {
      pollIncomingTypes()
    }, 3500)
  }

  const stopIncomingPolling = () => {
    if (incomingPoll) {
      clearInterval(incomingPoll)
      incomingPoll = null
    }
  }

  let stopPollingWatch: (() => void) | null = null

  onMounted(() => {
    if (shouldPollIncoming.value) {
      startIncomingPolling()
    }

    stopPollingWatch = watch(shouldPollIncoming, (enabled) => {
      if (enabled) {
        startIncomingPolling()
        return
      }

      stopIncomingPolling()
    })
  })

  onBeforeUnmount(() => {
    if (stopPollingWatch) {
      stopPollingWatch()
      stopPollingWatch = null
    }
    stopIncomingPolling()
    clearOutgoingTimers()
  })

  return {
    activeSession,
    answerIncomingCall,
    cancelOutgoingCall,
    declineIncomingCall,
    errorMessage,
    finishActiveCall,
    isCallActionPending,
    resetRinging,
    ringingCall,
    startCall,
    status,
  }
}
