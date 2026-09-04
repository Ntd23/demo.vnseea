// Description: Coordinates message call state through Socket.IO events, PHP reconciliation, and LiveKit sessions.

import type { Ref } from "vue"
import type { Socket } from "socket.io-client"
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

type RingingGroupCall = {
  id: number
  type: "video"
  direction: "incoming" | "outgoing"
  groupId: number
  groupName: string
  avatar?: string
  url?: string
}

type ActiveGroupCall = {
  id: number
  type: "video"
}

type MessageCallOptions = {
  pollIncoming?: boolean | Ref<boolean>
}

type DirectCallRealtimePayload = {
  call_id?: number | string
  call_type?: MessageCallType
  status?: string
  peer?: {
    id?: number | string
    name?: string
    avatar?: string
  }
}

type GroupCallRealtimePayload = {
  call_id?: number | string
  group_id?: number | string
  call_type?: string
  status?: string
  room_name?: string
  group?: {
    id?: number | string
    name?: string
    avatar?: string
  }
}

const OUTGOING_FALLBACK_INTERVAL_MS = 2000
const OUTGOING_RECONCILE_INTERVAL_MS = 10000
const INCOMING_FALLBACK_INTERVAL_MS = 5000
const INCOMING_RECONCILE_INTERVAL_MS = 10000
const NO_ANSWER_MS = 43000
let outgoingPoll: ReturnType<typeof setInterval> | null = null
let incomingPoll: ReturnType<typeof setInterval> | null = null
let noAnswerTimer: ReturnType<typeof setTimeout> | null = null
let incomingPollPending = false
let outgoingSyncPending = false
let incomingPollingConsumers = 0

import.meta.hot?.dispose(() => {
  if (outgoingPoll) {
    clearInterval(outgoingPoll)
    outgoingPoll = null
  }
  if (incomingPoll) {
    clearInterval(incomingPoll)
    incomingPoll = null
  }
  if (noAnswerTimer) {
    clearTimeout(noAnswerTimer)
    noAnswerTimer = null
  }

  incomingPollPending = false
  outgoingSyncPending = false
  incomingPollingConsumers = 0
})

export function useMessageCalls(
  repository = createApiMessageCallsRepository(),
  options: MessageCallOptions = {},
) {
  const ringingCall = useState<RingingCall | null>("messages:call:ringing", () => null)
  const activeSession = useState<MessageCallSession | null>("messages:call:active", () => null)
  const activeGroupCall = useState<ActiveGroupCall | null>("messages:group-call:active", () => null)
  const ringingGroupCall = useState<RingingGroupCall | null>("messages:group-call:ringing", () => null)
  const status = useState<MessageCallStatus>("messages:call:status", () => "idle")
  const errorMessage = useState("messages:call:error", () => "")
  const isCallActionPending = useState("messages:call:pending", () => false)
  const realtimeConnected = useState("messages:call:realtime-connected", () => false)
  const callSocket = shallowRef<Socket | null>(null)
  const connectingRealtime = ref(false)
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

  const clearOutgoingSyncTimer = () => {
    if (outgoingPoll) {
      clearInterval(outgoingPoll)
      outgoingPoll = null
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

  const syncOutgoingAnswer = async (id: number, type: MessageCallType) => {
    if (outgoingSyncPending) {
      return false
    }

    outgoingSyncPending = true
    const result = await repository.getOutgoingStatus({ id, type }).catch(() => null)

    try {
      if (!result) {
        return false
      }

      if (result.status === 200) {
        clearOutgoingTimers()
        await fetchPayload(id, type).catch((error) => {
          errorMessage.value = error?.statusMessage || "Can not join call."
          status.value = "error"
        })
        return true
      }

      if (result.status === 400) {
        clearOutgoingTimers()
        ringingCall.value = null
        status.value = "declined"
        return true
      }

      return false
    }
    finally {
      outgoingSyncPending = false
    }
  }

  const pollOutgoingAnswer = (id: number, type: MessageCallType) => {
    clearOutgoingTimers()
    void syncOutgoingAnswer(id, type)
    outgoingPoll = setInterval(() => {
      void syncOutgoingAnswer(id, type)
    }, realtimeConnected.value ? OUTGOING_RECONCILE_INTERVAL_MS : OUTGOING_FALLBACK_INTERVAL_MS)

    noAnswerTimer = setTimeout(async () => {
      clearOutgoingTimers()
      await endBackendCall({ id, type, status: "no_answer" })
      ringingCall.value = null
      status.value = "no_answer"
    }, NO_ANSWER_MS)
  }

  const startCall = async (contact: MessageContact, type: MessageCallType) => {
    if (!contact.userId || isCallActionPending.value || ringingCall.value || activeSession.value || activeGroupCall.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""
    status.value = "ringing"
    ringingCall.value = {
      id: 0,
      type,
      direction: "outgoing",
      peer: {
        name: contact.name,
        avatar: contact.avatarUrl,
      },
    }

    try {
      const result = await repository.createCall({
        userId: contact.userId,
        type,
      })

      if (result.busy || result.id <= 0) {
        ringingCall.value = null
        status.value = "busy"
        errorMessage.value = result.message || "Recipient is busy."
        return
      }

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
      ringingCall.value = null
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not start call."
    }
    finally {
      isCallActionPending.value = false
    }
  }

  const startGroupCall = async (contact: MessageContact) => {
    if (!contact.groupId || contact.type !== "group" || isCallActionPending.value || activeGroupCall.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""

    try {
      const result = await repository.createGroupCall({
        groupId: contact.groupId,
      })

      if (result.status !== 200 || result.id <= 0) {
        status.value = "error"
        errorMessage.value = "Can not start group call."
        return
      }

      ringingGroupCall.value = null
      activeGroupCall.value = {
        id: result.id,
        type: result.type,
      }
      status.value = "active"
    }
    catch (error: any) {
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not start group call."
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
    if (ringingCall.value || ringingGroupCall.value || activeSession.value || activeGroupCall.value) {
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

  const validateCurrentIncomingGroupCall = async () => {
    const call = ringingGroupCall.value

    if (!call || call.direction !== "incoming") {
      return false
    }

    const incoming = await repository.getIncomingGroupCall().catch(() => undefined)
    if (incoming === undefined || activeGroupCall.value) {
      return true
    }

    if (!incoming || incoming.id !== call.id) {
      ringingGroupCall.value = null
      status.value = "idle"
      return false
    }

    return true
  }

  const pollIncomingTypes = async () => {
    if (incomingPollPending || activeSession.value || activeGroupCall.value || (import.meta.client && document.visibilityState === "hidden")) {
      return
    }

    incomingPollPending = true

    try {
      if (ringingGroupCall.value?.direction === "incoming") {
        const stillRinging = await validateCurrentIncomingGroupCall()
        if (stillRinging) {
          return
        }
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

      if (!ringingCall.value) {
        await pollIncoming("audio")
      }

      if (!ringingCall.value && !ringingGroupCall.value && !activeSession.value && !activeGroupCall.value) {
        const incomingGroup = await repository.getIncomingGroupCall().catch(() => null)

        if (incomingGroup?.id) {
          ringingGroupCall.value = {
            id: incomingGroup.id,
            type: incomingGroup.type,
            direction: "incoming",
            groupId: incomingGroup.groupId,
            groupName: incomingGroup.groupName,
            avatar: incomingGroup.avatar,
            url: incomingGroup.url,
          }
          status.value = "ringing"
        }
      }
    }
    finally {
      incomingPollPending = false
    }
  }

  let ownsIncomingPolling = false

  const scheduleIncomingPolling = () => {
    if (!import.meta.client || incomingPoll || incomingPollingConsumers === 0) {
      return
    }

    const delay = realtimeConnected.value
      ? INCOMING_RECONCILE_INTERVAL_MS
      : INCOMING_FALLBACK_INTERVAL_MS

    incomingPoll = window.setTimeout(async () => {
      incomingPoll = null
      await pollIncomingTypes()

      if (!realtimeConnected.value && !callSocket.value) {
        await connectCallRealtime()
      }

      scheduleIncomingPolling()
    }, delay)
  }

  const startIncomingPolling = () => {
    if (!import.meta.client) {
      return
    }

    if (!ownsIncomingPolling) {
      incomingPollingConsumers += 1
      ownsIncomingPolling = true
    }

    if (incomingPoll) {
      return
    }

    void pollIncomingTypes()
    scheduleIncomingPolling()
  }

  const stopIncomingPolling = () => {
    if (!ownsIncomingPolling) {
      return
    }

    ownsIncomingPolling = false
    incomingPollingConsumers = Math.max(0, incomingPollingConsumers - 1)

    if (incomingPollingConsumers === 0 && incomingPoll) {
      window.clearTimeout(incomingPoll)
      incomingPoll = null
    }
  }

  const realtimeCallType = (value: unknown): MessageCallType =>
    value === "audio" ? "audio" : "video"

  const realtimeCallId = (value: unknown) => {
    const id = Number(value ?? 0)
    return Number.isFinite(id) && id > 0 ? id : 0
  }

  const closeDirectCallFromRealtime = (payload: DirectCallRealtimePayload, declined = false) => {
    const id = realtimeCallId(payload.call_id)
    if (!id) {
      return
    }

    if (ringingCall.value?.id === id) {
      clearOutgoingTimers()
      ringingCall.value = null
    }

    if (activeSession.value?.id === id) {
      activeSession.value = null
    }

    if (!ringingCall.value && !activeSession.value) {
      status.value = declined || payload.status === "declined" ? "declined" : "ended"
    }
  }

  const closeGroupCallFromRealtime = (payload: GroupCallRealtimePayload) => {
    const id = realtimeCallId(payload.call_id)
    if (!id) {
      return
    }

    if (ringingGroupCall.value?.id === id) {
      ringingGroupCall.value = null
    }

    if (activeGroupCall.value?.id === id) {
      activeGroupCall.value = null
    }

    if (!ringingGroupCall.value && !activeGroupCall.value) {
      status.value = "ended"
    }
  }

  const disconnectCallRealtime = () => {
    const realtimeSocket = callSocket.value

    if (!realtimeSocket) {
      return
    }

    callSocket.value = null
    realtimeConnected.value = false

    realtimeSocket.removeAllListeners()
    realtimeSocket.disconnect()
  }

  const connectCallRealtime = async () => {
    if (!import.meta.client || !shouldPollIncoming.value || callSocket.value || connectingRealtime.value) {
      return
    }

    connectingRealtime.value = true

    try {
      const auth = await repository.getRealtimeToken()

      if (!auth.enabled || !auth.token || !auth.url) {
        realtimeConnected.value = false
        startIncomingPolling()
        return
      }

      const { io } = await import("socket.io-client")
      const realtimeSocket = io(auth.url, {
        auth: {
          token: auth.token,
        },
        transports: ["websocket"],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      })

      realtimeSocket.on("connect", () => {
        realtimeConnected.value = true
        void pollIncomingTypes()
        scheduleIncomingPolling()

        const outgoing = ringingCall.value
        if (outgoing?.direction === "outgoing" && outgoing.id > 0) {
          clearOutgoingSyncTimer()
          outgoingPoll = setInterval(() => {
            void syncOutgoingAnswer(outgoing.id, outgoing.type)
          }, OUTGOING_RECONCILE_INTERVAL_MS)
          void syncOutgoingAnswer(outgoing.id, outgoing.type)
        }
      })

      realtimeSocket.on("disconnect", (reason) => {
        realtimeConnected.value = false
        startIncomingPolling()

        const outgoing = ringingCall.value
        if (outgoing?.direction === "outgoing" && outgoing.id > 0) {
          clearOutgoingSyncTimer()
          outgoingPoll = setInterval(() => {
            void syncOutgoingAnswer(outgoing.id, outgoing.type)
          }, OUTGOING_FALLBACK_INTERVAL_MS)
        }

        if (reason === "io server disconnect") {
          realtimeSocket.connect()
        }
      })

      realtimeSocket.on("connect_error", () => {
        realtimeConnected.value = false
        if (callSocket.value === realtimeSocket) {
          callSocket.value = null
        }
        realtimeSocket.removeAllListeners()
        realtimeSocket.disconnect()
        startIncomingPolling()
      })

      realtimeSocket.on("livekit_call_incoming", (payload: DirectCallRealtimePayload = {}) => {
        const id = realtimeCallId(payload.call_id)
        if (!id || ringingCall.value || ringingGroupCall.value || activeSession.value || activeGroupCall.value) {
          return
        }

        ringingCall.value = {
          id,
          type: realtimeCallType(payload.call_type),
          direction: "incoming",
          peer: {
            name: String(payload.peer?.name || "Contact"),
            avatar: String(payload.peer?.avatar || ""),
          },
        }
        status.value = "ringing"
      })

      realtimeSocket.on("livekit_call_answered", (payload: DirectCallRealtimePayload = {}) => {
        const id = realtimeCallId(payload.call_id)
        const outgoing = ringingCall.value

        if (id && outgoing?.direction === "outgoing" && outgoing.id === id) {
          void syncOutgoingAnswer(id, realtimeCallType(payload.call_type || outgoing.type))
        }
      })

      realtimeSocket.on("livekit_call_declined", (payload: DirectCallRealtimePayload = {}) => {
        closeDirectCallFromRealtime(payload, true)
      })

      realtimeSocket.on("livekit_call_closed", (payload: DirectCallRealtimePayload = {}) => {
        closeDirectCallFromRealtime(payload)
      })

      realtimeSocket.on("livekit_group_call_incoming", (payload: GroupCallRealtimePayload = {}) => {
        const id = realtimeCallId(payload.call_id)
        const groupId = realtimeCallId(payload.group_id || payload.group?.id)

        if (!id || !groupId || ringingCall.value || ringingGroupCall.value || activeSession.value || activeGroupCall.value) {
          return
        }

        ringingGroupCall.value = {
          id,
          type: "video",
          direction: "incoming",
          groupId,
          groupName: String(payload.group?.name || "Group call"),
          avatar: String(payload.group?.avatar || ""),
        }
        status.value = "ringing"
      })

      realtimeSocket.on("livekit_group_call_sync", (payload: GroupCallRealtimePayload = {}) => {
        if (payload.status && payload.status !== "active") {
          closeGroupCallFromRealtime(payload)
        }
      })

      realtimeSocket.on("livekit_group_call_closed", (payload: GroupCallRealtimePayload = {}) => {
        closeGroupCallFromRealtime(payload)
      })

      callSocket.value = realtimeSocket
    }
    catch {
      realtimeConnected.value = false
      callSocket.value = null
      startIncomingPolling()
    }
    finally {
      connectingRealtime.value = false
    }
  }

  const answerGroupCall = async () => {
    const call = ringingGroupCall.value

    if (!call || isCallActionPending.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""

    try {
      const result = await repository.joinGroupCall({ id: call.id })

      if (result.status !== 200 || result.id <= 0) {
        status.value = "error"
        errorMessage.value = "Can not join group call."
        return
      }

      ringingGroupCall.value = null
      activeGroupCall.value = {
        id: result.id,
        type: result.type,
      }
      status.value = "active"
    }
    catch (error: any) {
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not join group call."
      await validateCurrentIncomingGroupCall()
    }
    finally {
      isCallActionPending.value = false
    }
  }

  const joinGroupCall = async (callId: number) => {
    if (!callId || isCallActionPending.value) {
      return
    }

    isCallActionPending.value = true
    errorMessage.value = ""

    try {
      const result = await repository.joinGroupCall({ id: callId })

      if (result.status !== 200 || result.id <= 0) {
        status.value = "error"
        errorMessage.value = "Can not join group call."
        return
      }

      activeGroupCall.value = {
        id: result.id,
        type: result.type,
      }
      status.value = "active"
    }
    catch (error: any) {
      status.value = "error"
      errorMessage.value = error?.statusMessage || "Can not join group call."
    }
    finally {
      isCallActionPending.value = false
    }
  }

  const declineGroupCall = async () => {
    const call = ringingGroupCall.value

    if (!call) {
      return
    }

    await repository.declineGroupCall({ id: call.id }).catch(() => null)
    ringingGroupCall.value = null
    status.value = "declined"
  }

  const cancelGroupCall = async () => {
    const call = ringingGroupCall.value

    if (!call) {
      return
    }

    await repository.leaveGroupCall({ id: call.id }).catch(() => null)
    clearOutgoingTimers()
    ringingGroupCall.value = null
    status.value = "idle"
  }

  const finishGroupCall = () => {
    activeGroupCall.value = null
    status.value = "ended"
  }

  let stopPollingWatch: (() => void) | null = null

  onMounted(() => {
    if (shouldPollIncoming.value) {
      startIncomingPolling()
      void connectCallRealtime()
    }

    stopPollingWatch = watch(shouldPollIncoming, (enabled) => {
      if (enabled) {
        startIncomingPolling()
        void connectCallRealtime()
        return
      }

      stopIncomingPolling()
      disconnectCallRealtime()
    })
  })

  onBeforeUnmount(() => {
    const ownsCallRuntime = ownsIncomingPolling || Boolean(callSocket.value) || shouldPollIncoming.value

    if (stopPollingWatch) {
      stopPollingWatch()
      stopPollingWatch = null
    }
    stopIncomingPolling()
    disconnectCallRealtime()
    if (ownsCallRuntime) {
      clearOutgoingTimers()
    }
  })

  return {
    activeSession,
    activeGroupCall,
    answerGroupCall,
    answerIncomingCall,
    cancelOutgoingCall,
    cancelGroupCall,
    declineGroupCall,
    declineIncomingCall,
    errorMessage,
    finishActiveCall,
    finishGroupCall,
    isCallActionPending,
    joinGroupCall,
    resetRinging,
    ringingGroupCall,
    ringingCall,
    realtimeConnected,
    startCall,
    startGroupCall,
    status,
  }
}
