// English description: Orchestrates the right-sidebar chat widget with real inbox data, mini-thread loading, quick send actions, and user online presence refresh.

import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue"
import type { Socket } from "socket.io-client"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { MessageContact, MessageItem, MessageSendDraft, MessageThread } from "../../../messages/domain/types/messages.types"
import { createApiMessagesRepository } from "../../../messages/infrastructure/repositories/ApiMessagesRepository"

type ChatWidgetTab = "send" | "contacts" | "groups"

const INBOX_REFRESH_INTERVAL_MS = 20000

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase()
}

function filterContacts(contacts: MessageContact[], keyword: string) {
  const normalizedKeyword = normalizeKeyword(keyword)

  if (!normalizedKeyword) {
    return contacts
  }

  return contacts.filter((contact) => {
    const searchable = [
      contact.name,
      contact.status,
      contact.preview,
      ...(contact.members ?? []),
    ]
      .join(" ")
      .toLowerCase()

    return searchable.includes(normalizedKeyword)
  })
}

function createEmptyThread(): MessageThread {
  return {
    messages: [],
    typing: false,
  }
}

function createSendDraft(text: string, file: File | null): MessageSendDraft {
  return {
    text: text.trim(),
    file,
    record: null,
  }
}

function formatLastSeenLabel(lastSeenAt: number | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (!lastSeenAt || lastSeenAt <= 0) {
    return ""
  }

  const diffInSeconds = Math.max(Math.floor(Date.now() / 1000) - lastSeenAt, 0)
  const minutes = Math.max(1, Math.floor(diffInSeconds / 60))

  if (minutes < 60) {
    return t("navigation.chatWidget.activeMinutesAgo", { count: minutes })
  }

  const hours = Math.max(1, Math.floor(minutes / 60))

  if (hours < 24) {
    return t("navigation.chatWidget.activeHoursAgo", { count: hours })
  }

  const days = Math.max(1, Math.floor(hours / 24))

  if (days < 7) {
    return t("navigation.chatWidget.activeDaysAgo", { count: days })
  }

  const weeks = Math.max(1, Math.floor(days / 7))

  if (weeks < 5) {
    return t("navigation.chatWidget.activeWeeksAgo", { count: weeks })
  }

  const months = Math.max(1, Math.floor(days / 30))

  if (months < 12) {
    return t("navigation.chatWidget.activeMonthsAgo", { count: months })
  }

  const years = Math.max(1, Math.floor(days / 365))
  return t("navigation.chatWidget.activeYearsAgo", { count: years })
}

function buildMessagesRouteQuery(contact?: MessageContact | null) {
  if (!contact) {
    return {}
  }

  if (contact.type === "group" && contact.groupId) {
    return {
      tab: "group",
      groupId: String(contact.groupId),
      name: contact.name,
    }
  }

  if (contact.type === "user" && contact.userId) {
    return {
      userId: String(contact.userId),
      name: contact.name,
    }
  }

  if (contact.type === "page" && contact.pageId && contact.recipientId) {
    return {
      userId: String(contact.recipientId),
      name: contact.name,
    }
  }

  return {}
}

export function useChatWidgetVM() {
  const { t } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const repository = createApiMessagesRepository()

  const activeTab = ref<ChatWidgetTab>("contacts")
  const search = ref("")
  const sendTo = ref("")
  const sendMessage = ref("")
  const attachFile = ref<File | null>(null)
  const selectedSendTargetId = ref("")

  const miniChatOpen = ref(false)
  const miniChatMessage = ref("")
  const activeMiniContactId = ref("")
  const miniThread = ref<MessageThread>(createEmptyThread())
  const isLoadingThread = ref(false)
  const isSendingQuick = ref(false)
  const isSendingMini = ref(false)
  const socket = shallowRef<Socket | null>(null)
  const refreshTimer = shallowRef<number | null>(null)

  const {
    data: inbox,
    status: inboxStatus,
    refresh: refreshInboxData,
  } = useAsyncData(
    "navigation:chat-widget:inbox",
    () => repository.getInbox(),
    {
      default: () => [],
    },
  )

  const allContacts = computed(() =>
    (inbox.value ?? []).filter(contact =>
      contact.type === "user" || contact.type === "group",
    ),
  )

  const userContacts = computed(() =>
    allContacts.value.filter(contact => contact.type === "user"),
  )

  const groupContacts = computed(() =>
    allContacts.value.filter(contact => contact.type === "group"),
  )

  const onlineCount = computed(() =>
    userContacts.value.filter(contact => contact.isOnline).length,
  )

  const filteredContacts = computed(() =>
    filterContacts(userContacts.value, search.value),
  )

  const filteredGroups = computed(() =>
    filterContacts(groupContacts.value, search.value),
  )

  const selectedSendTarget = computed(() =>
    allContacts.value.find(contact => contact.id === selectedSendTargetId.value) ?? null,
  )

  const sendCandidates = computed(() => {
    const source = [...userContacts.value, ...groupContacts.value]
    const filtered = filterContacts(source, sendTo.value)

    return filtered.slice(0, 6)
  })

  const activeMiniContact = computed(() =>
    allContacts.value.find(contact => contact.id === activeMiniContactId.value) ?? null,
  )

  const miniMessages = computed<MessageItem[]>(() =>
    miniThread.value.messages.slice(-14),
  )

  const implicitSendTarget = computed(() => {
    const keyword = normalizeKeyword(sendTo.value)

    if (!keyword) {
      return null
    }

    return sendCandidates.value.find(contact =>
      normalizeKeyword(contact.name) === keyword,
    ) ?? null
  })

  const activeSendTarget = computed(() =>
    selectedSendTarget.value ?? implicitSendTarget.value,
  )

  const isLoadingInbox = computed(() => inboxStatus.value === "pending")

  const canSendQuickMessage = computed(() =>
    Boolean(activeSendTarget.value)
    && (sendMessage.value.trim().length > 0 || Boolean(attachFile.value))
    && !isSendingQuick.value,
  )

  const canSendMiniMessage = computed(() =>
    Boolean(activeMiniContact.value)
    && miniChatMessage.value.trim().length > 0
    && !isSendingMini.value,
  )

  function buildPresenceLabel(contact: MessageContact) {
    if (contact.type === "group") {
      return t("navigation.chatWidget.groupMembers", {
        count: contact.memberCount ?? contact.members?.length ?? 0,
      })
    }

    if (contact.isOnline) {
      return t("navigation.chatWidget.onlineStatus")
    }

    const lastSeenLabel = formatLastSeenLabel(contact.lastSeenAt, t)

    if (lastSeenLabel) {
      return lastSeenLabel
    }

    return contact.status || t("navigation.chatWidget.offlineToday")
  }

  function buildPreviewLabel(contact: MessageContact) {
    return contact.preview || ""
  }

  function clearQuickSendForm(options?: { preserveRecipient?: boolean }) {
    sendMessage.value = ""
    attachFile.value = null

    if (!options?.preserveRecipient) {
      sendTo.value = ""
      selectedSendTargetId.value = ""
    }
  }

  function selectSendTarget(contact: MessageContact) {
    selectedSendTargetId.value = contact.id
    sendTo.value = contact.name
  }

  function clearSendTarget() {
    selectedSendTargetId.value = ""
    sendTo.value = ""
  }

  function resolveSelectedSendTarget() {
    if (selectedSendTarget.value) {
      return selectedSendTarget.value
    }

    const exactMatch = implicitSendTarget.value

    if (exactMatch) {
      selectSendTarget(exactMatch)
      return exactMatch
    }

    return null
  }

  async function refreshInboxSafely(options?: { silent?: boolean }) {
    try {
      await refreshInboxData()
    }
    catch {
      if (!options?.silent) {
        toast.add({
          title: t("navigation.chatWidget.inboxErrorTitle"),
          description: t("navigation.chatWidget.inboxErrorDescription"),
          color: "error",
        })
      }
    }
  }

  async function refreshMiniThread(options?: { silent?: boolean }) {
    const contact = activeMiniContact.value

    if (!contact) {
      miniThread.value = createEmptyThread()
      return
    }

    isLoadingThread.value = true

    try {
      miniThread.value = await repository.getThread(contact)
    }
    catch {
      if (!options?.silent) {
        toast.add({
          title: t("navigation.chatWidget.threadErrorTitle"),
          description: t("navigation.chatWidget.threadErrorDescription"),
          color: "error",
        })
      }
    }
    finally {
      isLoadingThread.value = false
    }
  }

  async function openMiniChat(contact: MessageContact) {
    activeMiniContactId.value = contact.id
    miniChatOpen.value = true
    miniChatMessage.value = ""
    await refreshMiniThread()
  }

  function closeMiniChat() {
    miniChatOpen.value = false
    miniChatMessage.value = ""
    activeMiniContactId.value = ""
    miniThread.value = createEmptyThread()
  }

  async function sendMessageToContact(contact: MessageContact, draft: MessageSendDraft) {
    await repository.sendMessage(contact, draft)
    await Promise.all([
      refreshInboxSafely({ silent: true }),
      refreshMiniThread({ silent: true }),
    ])
  }

  async function sendQuickMessage() {
    const contact = resolveSelectedSendTarget()

    if (!contact) {
      toast.add({
        title: t("navigation.chatWidget.recipientRequiredTitle"),
        description: t("navigation.chatWidget.recipientRequiredDescription"),
        color: "warning",
      })
      return
    }

    if (!sendMessage.value.trim() && !attachFile.value) {
      toast.add({
        title: t("navigation.chatWidget.messageRequiredTitle"),
        description: t("navigation.chatWidget.messageRequiredDescription"),
        color: "warning",
      })
      return
    }

    isSendingQuick.value = true

    try {
      await repository.sendMessage(contact, createSendDraft(sendMessage.value, attachFile.value))
      await refreshInboxSafely({ silent: true })
      clearQuickSendForm({ preserveRecipient: true })
      activeTab.value = contact.type === "group" ? "groups" : "contacts"
      await openMiniChat(contact)
    }
    catch {
      toast.add({
        title: t("navigation.chatWidget.sendErrorTitle"),
        description: t("navigation.chatWidget.sendErrorDescription"),
        color: "error",
      })
    }
    finally {
      isSendingQuick.value = false
    }
  }

  async function sendMiniMessage() {
    const contact = activeMiniContact.value
    const text = miniChatMessage.value.trim()

    if (!contact || !text) {
      return
    }

    isSendingMini.value = true

    try {
      await sendMessageToContact(contact, {
        text,
        file: null,
        record: null,
      })
      miniChatMessage.value = ""
    }
    catch {
      toast.add({
        title: t("navigation.chatWidget.sendErrorTitle"),
        description: t("navigation.chatWidget.sendErrorDescription"),
        color: "error",
      })
    }
    finally {
      isSendingMini.value = false
    }
  }

  function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    const nextFile = input.files?.[0] ?? null
    attachFile.value = nextFile
    input.value = ""
  }

  function clearFile() {
    attachFile.value = null
  }

  async function openFullMessages(contact?: MessageContact | null) {
    await router.push({
      path: appRoutes.messages,
      query: buildMessagesRouteQuery(contact),
    })
  }

  async function openMessagesTab(tab?: "user" | "group" | "multi") {
    await router.push({
      path: appRoutes.messages,
      query: tab && tab !== "user" ? { tab } : {},
    })
  }

  function startRefreshTimer() {
    if (!import.meta.client || refreshTimer.value) {
      return
    }

    refreshTimer.value = window.setInterval(() => {
      void refreshInboxSafely({ silent: true })

      if (miniChatOpen.value) {
        void refreshMiniThread({ silent: true })
      }
    }, INBOX_REFRESH_INTERVAL_MS)
  }

  function stopRefreshTimer() {
    if (!import.meta.client || !refreshTimer.value) {
      return
    }

    window.clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }

  async function connectRealtime() {
    if (!import.meta.client || socket.value) {
      return
    }

    try {
      const auth = await repository.getRealtimeToken()

      if (!auth.enabled || !auth.token || !auth.url) {
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

      realtimeSocket.on("messages:count", () => {
        void refreshInboxSafely({ silent: true })

        if (miniChatOpen.value) {
          void refreshMiniThread({ silent: true })
        }
      })

      realtimeSocket.on("disconnect", () => {
        socket.value = null
      })

      realtimeSocket.on("connect_error", () => {
        realtimeSocket.disconnect()
        socket.value = null
      })

      socket.value = realtimeSocket
    }
    catch {
      socket.value = null
    }
  }

  watch(sendTo, (value) => {
    const currentTarget = selectedSendTarget.value

    if (!currentTarget) {
      return
    }

    if (normalizeKeyword(currentTarget.name) !== normalizeKeyword(value)) {
      selectedSendTargetId.value = ""
    }
  })

  watch(allContacts, (contacts) => {
    if (activeMiniContactId.value && !contacts.some(contact => contact.id === activeMiniContactId.value)) {
      closeMiniChat()
    }

    if (selectedSendTargetId.value && !contacts.some(contact => contact.id === selectedSendTargetId.value)) {
      clearSendTarget()
    }
  })

  onMounted(() => {
    startRefreshTimer()
    void refreshInboxSafely()
    void connectRealtime()
  })

  onBeforeUnmount(() => {
    stopRefreshTimer()

    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  })

  return {
    activeTab,
    search,
    sendTo,
    sendMessage,
    attachFile,
    selectedSendTarget,
    sendCandidates,
    filteredContacts,
    filteredGroups,
    onlineCount,
    miniChatOpen,
    miniChatMessage,
    activeMiniContact,
    miniMessages,
    isLoadingInbox,
    isLoadingThread,
    isSendingQuick,
    isSendingMini,
    canSendQuickMessage,
    canSendMiniMessage,
    buildPresenceLabel,
    buildPreviewLabel,
    selectSendTarget,
    clearSendTarget,
    openMiniChat,
    closeMiniChat,
    sendQuickMessage,
    sendMiniMessage,
    onFile,
    clearFile,
    openFullMessages,
    openMessagesTab,
  }
}
