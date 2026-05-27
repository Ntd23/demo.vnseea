// English description: Orchestrates the right-sidebar chat widget with real inbox data, mini-thread loading, quick send actions, and user online presence refresh.

import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue"
import type { Socket } from "socket.io-client"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"
import type { MessageContact, MessageItem, MessageRecordDraft, MessageSendDraft, MessageTagsPayload, MessageThread, MessageUserTag } from "../../../messages/domain/types/messages.types"
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

function mergeUserTags(left: MessageUserTag[] = [], right: MessageUserTag[] = []) {
  const tags = new Map<number, MessageUserTag>()

  for (const tag of [...left, ...right]) {
    if (tag.id > 0) {
      tags.set(tag.id, tag)
    }
  }

  return [...tags.values()]
}

function mergeContactTags(contact: MessageContact, taggedContact?: MessageContact) {
  if (!taggedContact) {
    return contact
  }

  return {
    ...contact,
    tags: mergeUserTags(contact.tags, taggedContact.tags),
  }
}

function createEmptyThread(): MessageThread {
  return {
    messages: [],
    typing: false,
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
  const activeSendTagFilter = ref("")
  const sendTo = ref("")
  const sendMessage = ref("")
  const attachFile = ref<File | null>(null)
  const selectedSendRecipientIds = ref<number[]>([])

  const miniChatOpen = ref(false)
  const miniChatAutoOpenVersion = ref(0)
  const miniChatMessage = ref("")
  const miniAttachFile = ref<File | null>(null)
  const activeMiniContactId = ref("")
  const miniThread = ref<MessageThread>(createEmptyThread())
  const isLoadingThread = ref(false)
  const isSendingQuick = ref(false)
  const isSendingMini = ref(false)
  const socket = shallowRef<Socket | null>(null)
  const refreshTimer = shallowRef<number | null>(null)
  const unreadSnapshot = shallowRef<Map<string, number>>(new Map())
  const hasUnreadSnapshot = ref(false)

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
  const hasLoadedInboxOnce = computed(() => (inbox.value?.length ?? 0) > 0)

  const {
    data: messageTags,
  } = useAsyncData<MessageTagsPayload>(
    "navigation:chat-widget:tags",
    () => repository.getTags(),
    {
      default: () => ({ labels: [], contacts: [] }),
    },
  )

  const allContacts = computed(() =>
    (inbox.value ?? []).filter(contact =>
      contact.type === "user" || contact.type === "group",
    ),
  )

  const userContacts = computed(() => {
    const taggedByUserId = new Map(
      (messageTags.value?.contacts ?? [])
        .map(contact => [contact.userId ?? 0, contact] as const)
        .filter(([id]) => id > 0),
    )

    return allContacts.value
      .filter(contact => contact.type === "user")
      .map(contact => mergeContactTags(contact, taggedByUserId.get(contact.userId ?? 0)))
  })

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

  const taggedSendRecipientSource = computed(() => {
    const contactsByUserId = new Map<number, MessageContact>()

    for (const contact of messageTags.value?.contacts ?? []) {
      const userId = contact.userId ?? 0

      if (userId <= 0) {
        continue
      }

      const current = contactsByUserId.get(userId)
      contactsByUserId.set(userId, current ? mergeContactTags(current, contact) : contact)
    }

    return [...contactsByUserId.values()]
  })

  const sendRecipientSource = computed(() => {
    const tagId = activeSendTagFilter.value
    const baseContacts = tagId ? taggedSendRecipientSource.value : userContacts.value

    if (!tagId || tagId === "0") {
      return baseContacts
    }

    const selectedTagId = Number(tagId)

    return baseContacts.filter(contact =>
      contact.tags?.some(tag => tag.id === selectedTagId),
    )
  })

  const sendCandidates = computed(() => {
    const filtered = filterContacts(sendRecipientSource.value, sendTo.value)

    return filtered
  })

  const selectedSendRecipients = computed(() => {
    const selectedIds = new Set(selectedSendRecipientIds.value)

    return sendRecipientSource.value.filter(contact =>
      selectedIds.has(contact.userId ?? 0),
    )
  })

  const activeMiniContact = computed(() =>
    allContacts.value.find(contact => contact.id === activeMiniContactId.value) ?? null,
  )

  const miniMessages = computed<MessageItem[]>(() =>
    miniThread.value.messages.slice(-14),
  )

  const visibleSendRecipientIds = computed(() =>
    sendCandidates.value
      .map(contact => contact.userId ?? 0)
      .filter(id => id > 0),
  )

  const allVisibleSendRecipientsSelected = computed(() =>
    visibleSendRecipientIds.value.length > 0
    && visibleSendRecipientIds.value.every(id => selectedSendRecipientIds.value.includes(id)),
  )

  const isLoadingInbox = computed(() => inboxStatus.value === "pending" && !hasLoadedInboxOnce.value)
  const messageTagLabels = computed(() => messageTags.value?.labels ?? [])

  const canSendQuickMessage = computed(() =>
    selectedSendRecipientIds.value.length > 0
    && (sendMessage.value.trim().length > 0 || Boolean(attachFile.value))
    && !isSendingQuick.value,
  )

  const canSendMiniMessage = computed(() =>
    Boolean(activeMiniContact.value)
    && (miniChatMessage.value.trim().length > 0 || Boolean(miniAttachFile.value))
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

  function updateUnreadSnapshot(contacts = allContacts.value) {
    unreadSnapshot.value = new Map(
      contacts.map(contact => [contact.id, contact.unreadCount ?? 0]),
    )
    hasUnreadSnapshot.value = true
  }

  function findNewIncomingContact(contacts = allContacts.value) {
    if (!hasUnreadSnapshot.value) {
      updateUnreadSnapshot(contacts)
      return null
    }

    const previous = unreadSnapshot.value

    return contacts.find((contact) => {
      const unreadCount = contact.unreadCount ?? 0
      const previousUnreadCount = previous.get(contact.id) ?? 0

      return unreadCount > previousUnreadCount
    }) ?? null
  }

  function clearQuickSendForm(options?: { preserveRecipient?: boolean }) {
    sendMessage.value = ""
    attachFile.value = null

    if (!options?.preserveRecipient) {
      sendTo.value = ""
      activeSendTagFilter.value = ""
      selectedSendRecipientIds.value = []
    }
  }

  function toggleSendRecipient(contact: MessageContact) {
    const userId = contact.userId ?? 0

    if (userId <= 0) {
      return
    }

    const nextIds = new Set(selectedSendRecipientIds.value)

    if (nextIds.has(userId)) {
      nextIds.delete(userId)
    }
    else {
      nextIds.add(userId)
    }

    selectedSendRecipientIds.value = [...nextIds]
  }

  function toggleAllVisibleSendRecipients() {
    const visibleIds = visibleSendRecipientIds.value

    if (visibleIds.length === 0) {
      return
    }

    if (allVisibleSendRecipientsSelected.value) {
      const visibleIdSet = new Set(visibleIds)
      selectedSendRecipientIds.value = selectedSendRecipientIds.value.filter(id => !visibleIdSet.has(id))
      return
    }

    selectedSendRecipientIds.value = [...new Set([
      ...selectedSendRecipientIds.value,
      ...visibleIds,
    ])]
  }

  function clearSendRecipients() {
    selectedSendRecipientIds.value = []
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

  async function refreshFromIncomingMessage() {
    await refreshInboxSafely({ silent: true })

    const incomingContact = findNewIncomingContact()
    updateUnreadSnapshot()

    if (!incomingContact) {
      if (miniChatOpen.value) {
        await refreshMiniThread({ silent: true })
      }
      return
    }

    await openMiniChat(incomingContact)
    miniChatAutoOpenVersion.value += 1
  }

  async function refreshMiniThread(options?: { silent?: boolean }) {
    const contact = activeMiniContact.value

    if (!contact) {
      miniThread.value = createEmptyThread()
      return
    }

    const shouldShowLoading = !options?.silent && miniThread.value.messages.length === 0
    if (shouldShowLoading) {
      isLoadingThread.value = true
    }

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
      if (shouldShowLoading) {
        isLoadingThread.value = false
      }
    }
  }

  async function openMiniChat(contact: MessageContact) {
    activeMiniContactId.value = contact.id
    miniChatOpen.value = true
    miniChatMessage.value = ""
    miniAttachFile.value = null
    await refreshMiniThread()
  }

  function closeMiniChat() {
    miniChatOpen.value = false
    miniChatMessage.value = ""
    miniAttachFile.value = null
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

  async function uploadRecordDraft(input: MessageRecordDraft) {
    return await repository.uploadRecord(input.blob, input.fileName, {
      mimeType: input.mimeType,
      durationMs: input.durationMs,
    })
  }

  async function sendQuickMessage() {
    if (selectedSendRecipientIds.value.length === 0) {
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
      const result = await repository.sendMultiMessage({
        recipientIds: selectedSendRecipientIds.value,
        text: sendMessage.value.trim(),
        file: attachFile.value,
        record: null,
      })

      if (result.status !== 200 && result.status !== 207) {
        throw new Error(result.error || "Unable to send multi message")
      }

      await refreshInboxSafely({ silent: true })

      if (result.status === 200) {
        clearQuickSendForm()
        activeTab.value = "contacts"
        toast.add({
          title: t("pages.messagesPage.multiSendSuccess", {
            count: result.sentCount,
          }),
          color: "success",
        })
        return
      }

      toast.add({
        title: t("pages.messagesPage.multiSendPartial", {
          sent: result.sentCount,
          failed: result.failedCount,
        }),
        color: "warning",
      })
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

  async function sendMiniMessage(options?: { record?: MessageRecordDraft | null, textOverride?: string }) {
    const contact = activeMiniContact.value
    const text = options?.textOverride ?? miniChatMessage.value.trim()
    const recordDraft = options?.record ?? null

    if (!contact || (!text && !miniAttachFile.value && !recordDraft)) {
      return
    }

    isSendingMini.value = true

    try {
      const uploadedRecord = recordDraft
        ? await uploadRecordDraft(recordDraft)
        : null
      await sendMessageToContact(contact, {
        text,
        file: miniAttachFile.value,
        record: uploadedRecord,
      })
      miniChatMessage.value = ""
      miniAttachFile.value = null
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

  async function reactToMiniMessage(messageId: number, reaction: FeedStoryReactionType) {
    if (!messageId || messageId <= 0) {
      return null
    }

    const result = await repository.reactToMessage({
      messageId,
      reaction,
    })

    miniThread.value = {
      ...miniThread.value,
      messages: miniThread.value.messages.map(message =>
        message.id === messageId
          ? { ...message, selectedReaction: result.reaction }
          : message,
      ),
    }

    return result
  }

  async function deleteMiniMessage(messageId: number) {
    if (!messageId || messageId <= 0) {
      return null
    }

    const result = await repository.deleteMessage({ messageId })

    miniThread.value = {
      ...miniThread.value,
      messages: miniThread.value.messages.map(message =>
        message.id === messageId
          ? {
              ...message,
              text: "",
              mediaUrl: "",
              mediaName: "",
              mediaType: undefined,
              selectedReaction: null,
              isDeleted: true,
              deletedAt: result.deletedAt,
              deletedTime: result.deletedTime,
              deletedByName: result.deletedByName,
            }
          : message,
      ),
    }

    return result
  }

  function onMiniFile(event: Event) {
    const input = event.target as HTMLInputElement
    miniAttachFile.value = input.files?.[0] ?? null
    input.value = ""
  }

  function clearMiniFile() {
    miniAttachFile.value = null
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
      void refreshFromIncomingMessage()
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
        void refreshFromIncomingMessage()
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

  watch([allContacts, messageTags], ([contacts, tagsPayload]) => {
    if (activeMiniContactId.value && !contacts.some(contact => contact.id === activeMiniContactId.value)) {
      closeMiniChat()
    }

    const availableUserIds = new Set(
      [...contacts, ...(tagsPayload?.contacts ?? [])]
        .map(contact => contact.userId ?? 0)
        .filter(id => id > 0),
    )
    selectedSendRecipientIds.value = selectedSendRecipientIds.value.filter(id => availableUserIds.has(id))

    if (!hasUnreadSnapshot.value && contacts.length > 0) {
      updateUnreadSnapshot(contacts)
      return
    }

    const contactIds = new Set(contacts.map(contact => contact.id))
    unreadSnapshot.value = new Map(
      [...unreadSnapshot.value.entries()].filter(([contactId]) => contactIds.has(contactId)),
    )
  })

  watch([activeSendTagFilter, sendCandidates], async ([tagFilter]) => {
    if (!tagFilter) {
      return
    }

    await nextTick()
    selectedSendRecipientIds.value = visibleSendRecipientIds.value
  }, { flush: "post" })

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
    activeSendTagFilter,
    sendTo,
    sendMessage,
    attachFile,
    allVisibleSendRecipientsSelected,
    sendCandidates,
    selectedSendRecipientIds,
    selectedSendRecipients,
    filteredContacts,
    filteredGroups,
    onlineCount,
    miniChatOpen,
    miniChatAutoOpenVersion,
    miniChatMessage,
    miniAttachFile,
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
    messageTagLabels,
    clearSendRecipients,
    toggleAllVisibleSendRecipients,
    toggleSendRecipient,
    openMiniChat,
    closeMiniChat,
    sendQuickMessage,
    sendMiniMessage,
    reactToMiniMessage,
    deleteMiniMessage,
    onMiniFile,
    clearMiniFile,
    onFile,
    clearFile,
    openFullMessages,
    openMessagesTab,
  }
}
