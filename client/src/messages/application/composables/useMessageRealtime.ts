// English description: Synchronizes messages inbox, active threads, and one-to-one typing state through Socket.IO with status-sync fallback for the active user thread.

import { computed, ref, shallowRef, watch } from "vue"
import type { Ref } from "vue"
import type { Socket } from "socket.io-client"
import type { MessagesRepository } from "../../domain/repositories/MessagesRepository"
import type { MessageContact, MessageTabKey } from "../../domain/types/messages.types"

const POLLING_INTERVAL_MS = 10000
const TYPING_IDLE_TIMEOUT_MS = 2400
const TYPING_STATUS_SYNC_INTERVAL_MS = 2000

type MessageRealtimeOptions = {
  repository: MessagesRepository
  activeTab: Ref<MessageTabKey>
  selectedContact: Ref<MessageContact | null>
  refreshInbox: () => Promise<unknown>
  refreshThread: () => Promise<unknown>
  setRemoteTyping: (value: boolean) => void
  setContactTyping: (userId: number, value: boolean) => void
}

export function useMessageRealtime(options: MessageRealtimeOptions) {
  const connected = ref(false)
  const connecting = ref(false)
  const pollingFallbackActive = ref(false)
  const socket = shallowRef<Socket | null>(null)
  const pollTimer = shallowRef<ReturnType<typeof window.setInterval> | null>(null)
  const typingIdleTimer = shallowRef<ReturnType<typeof window.setTimeout> | null>(null)
  const typingStatusTimer = shallowRef<ReturnType<typeof window.setInterval> | null>(null)
  const remoteTypingTimers = shallowRef<Map<number, ReturnType<typeof window.setTimeout>>>(new Map())
  const activeTypingRecipientId = ref(0)

  const isUserThread = computed(() =>
    options.activeTab.value === "user"
    && options.selectedContact.value?.type === "user"
    && (options.selectedContact.value.userId ?? 0) > 0,
  )

  const clearTypingIdleTimer = () => {
    if (import.meta.client && typingIdleTimer.value) {
      window.clearTimeout(typingIdleTimer.value)
      typingIdleTimer.value = null
    }
  }

  const clearRemoteTypingTimer = (userId: number) => {
    if (!import.meta.client || userId <= 0) {
      return
    }

    const timer = remoteTypingTimers.value.get(userId)

    if (timer) {
      window.clearTimeout(timer)
      remoteTypingTimers.value.delete(userId)
    }
  }

  const scheduleRemoteTypingExpiry = (userId: number) => {
    if (!import.meta.client || userId <= 0) {
      return
    }

    clearRemoteTypingTimer(userId)

    const timer = window.setTimeout(() => {
      options.setContactTyping(userId, false)

      if ((options.selectedContact.value?.userId ?? 0) === userId) {
        options.setRemoteTyping(false)
      }

      remoteTypingTimers.value.delete(userId)
    }, TYPING_IDLE_TIMEOUT_MS + 1000)

    remoteTypingTimers.value.set(userId, timer)
  }

  const stopTypingStatusSync = () => {
    if (import.meta.client && typingStatusTimer.value) {
      window.clearInterval(typingStatusTimer.value)
      typingStatusTimer.value = null
    }
  }

  const stopPolling = () => {
    if (import.meta.client && pollTimer.value) {
      window.clearInterval(pollTimer.value)
      pollTimer.value = null
    }
  }

  const refreshActiveThread = async () => {
    if (options.activeTab.value === "multi" || !options.selectedContact.value) {
      return
    }

    await options.refreshThread()
  }

  const refreshFromIncomingMessage = async () => {
    await options.refreshInbox()
    await refreshActiveThread()
  }

  const startPolling = () => {
    if (!import.meta.client || pollTimer.value) {
      return
    }

    pollingFallbackActive.value = true
    pollTimer.value = window.setInterval(() => {
      if (!connected.value) {
        void refreshFromIncomingMessage()
        void connectSocket(true)
      }
    }, POLLING_INTERVAL_MS)
  }

  const connectSocket = async (allowRetry = false) => {
    if (!import.meta.client || socket.value || connecting.value) {
      return
    }

    if (pollingFallbackActive.value && !allowRetry) {
      return
    }

    connecting.value = true

    try {
      const auth = await options.repository.getRealtimeToken()

      if (!auth.enabled || !auth.token || !auth.url) {
        connected.value = false
        startPolling()
        return
      }

      const { io } = await import("socket.io-client")
      const realtimeSocket = io(auth.url, {
        auth: {
          token: auth.token,
        },
        transports: ["websocket"],
        timeout: 5000,
        reconnection: false,
      })

      realtimeSocket.on("connect", () => {
        connected.value = true
        pollingFallbackActive.value = false
        stopPolling()
      })

      realtimeSocket.on("disconnect", () => {
        connected.value = false
        socket.value = null
        startPolling()
      })

      realtimeSocket.on("connect_error", () => {
        connected.value = false
        socket.value = null
        realtimeSocket.disconnect()
        startPolling()
      })

      realtimeSocket.on("messages:count", () => {
        void refreshFromIncomingMessage()
      })

      realtimeSocket.on("message:typing", (payload: { senderId?: number | string } = {}) => {
        const senderId = Number(payload.senderId || 0)

        if (senderId <= 0) {
          return
        }

        options.setContactTyping(senderId, true)
        scheduleRemoteTypingExpiry(senderId)

        if ((options.selectedContact.value?.userId ?? 0) === senderId) {
          options.setRemoteTyping(true)
        }
      })

      realtimeSocket.on("message:typing-stop", (payload: { senderId?: number | string } = {}) => {
        const senderId = Number(payload.senderId || 0)

        if (senderId <= 0) {
          return
        }

        clearRemoteTypingTimer(senderId)
        options.setContactTyping(senderId, false)

        if ((options.selectedContact.value?.userId ?? 0) === senderId) {
          options.setRemoteTyping(false)
        }
      })

      socket.value = realtimeSocket
    }
    catch {
      connected.value = false
      socket.value = null
      startPolling()
    }
    finally {
      connecting.value = false
    }
  }

  const syncTypingState = async (userId: number) => {
    if (userId <= 0) {
      options.setRemoteTyping(false)
      return
    }

    try {
      const status = await options.repository.getTyping(userId)
      const typing = status.enabled && status.typing

      options.setRemoteTyping(typing)
      options.setContactTyping(userId, typing)

      if (typing) {
        scheduleRemoteTypingExpiry(userId)
      }
      else {
        clearRemoteTypingTimer(userId)
      }
    }
    catch {
      options.setRemoteTyping(false)
      options.setContactTyping(userId, false)
      clearRemoteTypingTimer(userId)
    }
  }

  const startTypingStatusSync = () => {
    if (!import.meta.client || typingStatusTimer.value || !isUserThread.value) {
      return
    }

    const userId = options.selectedContact.value?.userId ?? 0

    if (userId <= 0) {
      options.setRemoteTyping(false)
      return
    }

    void syncTypingState(userId)
    typingStatusTimer.value = window.setInterval(() => {
      const activeUserId = options.selectedContact.value?.userId ?? 0

      if (!isUserThread.value || activeUserId <= 0) {
        stopTypingStatusSync()
        options.setRemoteTyping(false)
        return
      }

      void syncTypingState(activeUserId)
    }, TYPING_STATUS_SYNC_INTERVAL_MS)
  }

  const stopTyping = async (userId = activeTypingRecipientId.value) => {
    clearTypingIdleTimer()

    if (userId <= 0) {
      activeTypingRecipientId.value = 0
      return
    }

    activeTypingRecipientId.value = 0

    try {
      await options.repository.clearTyping(userId)
    }
    catch {
      // Silent: clearing typing should not block messaging.
    }

    socket.value?.emit("message:typing-stop", {
      recipientId: userId,
    })
  }

  const startTyping = async (userId: number) => {
    if (userId <= 0) {
      return
    }

    clearTypingIdleTimer()
    typingIdleTimer.value = window.setTimeout(() => {
      void stopTyping(userId)
    }, TYPING_IDLE_TIMEOUT_MS)

    if (activeTypingRecipientId.value === userId) {
      return
    }

    activeTypingRecipientId.value = userId

    try {
      await options.repository.setTyping(userId)
    }
    catch {
      // Silent: typing is auxiliary state.
    }

    socket.value?.emit("message:typing", {
      recipientId: userId,
    })
  }

  const start = async () => {
    if (!import.meta.client) {
      return
    }

    await connectSocket()
    startTypingStatusSync()

    if (!connected.value) {
      startPolling()
    }
  }

  const stop = async () => {
    clearTypingIdleTimer()
    stopTypingStatusSync()
    stopPolling()
    for (const userId of remoteTypingTimers.value.keys()) {
      clearRemoteTypingTimer(userId)
    }
    await stopTyping()

    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }

    connected.value = false
    connecting.value = false
    options.setRemoteTyping(false)
  }

  watch(
    () => [options.activeTab.value, options.selectedContact.value?.type || "", options.selectedContact.value?.userId || 0] as const,
    ([tab, type, userId]) => {
      stopTypingStatusSync()

      if (tab === "user" && type === "user" && userId > 0) {
        startTypingStatusSync()
        return
      }

      options.setRemoteTyping(false)
    },
    { immediate: true },
  )

  return {
    connected,
    connecting,
    pollingFallbackActive,
    start,
    stop,
    startTyping,
    stopTyping,
    syncTypingState,
  }
}
