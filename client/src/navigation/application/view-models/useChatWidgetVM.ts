// English description: Orchestrates the right-sidebar chat widget with real inbox data, mini-thread loading, quick send actions, and user online presence refresh.

import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue"
import type { Socket } from "socket.io-client"
import { appRoutes } from "#shared-kernel/application/constants/route-registry"
import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions"
import type { MessageContact, MessageItem, MessageProductCard, MessageRecordDraft, MessageSendDraft, MessageTagsPayload, MessageThread, MessageUserTag } from "../../../messages/domain/types/messages.types"
import type { MessagesRepository } from "../../../messages/domain/repositories/MessagesRepository"
import { getMessageLocationMeta } from "../../../messages/application/utils/message-location"
import { createApiMessagesRepository } from "../../../messages/infrastructure/repositories/ApiMessagesRepository"
import { sortUserInboxContacts } from "../../../messages/application/utils/message-contact-order"
import {
  getMessagePresenceUserIds,
  normalizeMessagePresenceEvent,
  watchMessagePresenceUsers,
} from "../../../messages/application/utils/message-presence-realtime"
import {
  validateMessageAttachment,
  type UploadValidationResult,
} from "../../../shared-kernel/application/utils/uploadValidation"
import { useUploadPolicyStore } from "../../../shared-kernel/application/stores/useUploadPolicyStore"
import { useChatWidgetLauncher, type ProductChatLaunchRequest } from "../composables/useChatWidgetLauncher"

type ChatWidgetTab = "send" | "contacts" | "groups"
type MiniChatDraft = {
  tempId: number
  text: string
  file: File | null
  record: MessageRecordDraft | null
}
type MiniChatSession = {
  contactId: string
  message: string
  attachFile: File | null
  attachFilePreviewUrl?: string | null
  thread: MessageThread
  isLoading: boolean
  isLoadingMore: boolean
  isSending: boolean
  minimized: boolean
  openedAt: number
  productDraft?: MessageProductCard | null
  productSuggestions?: string[]
  sendQueue?: MiniChatDraft[]
}
type MiniChatSessionView = MiniChatSession & {
  contact: MessageContact
  messages: MessageItem[]
  canSend: boolean
}

const INBOX_REFRESH_INTERVAL_MS = 2000
const MAX_MINI_CHAT_SESSIONS = 2

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
    pinnedMessages: [],
    typing: false,
  }
}

function sortMiniMessages(messages: MessageItem[]) {
  return [...messages].sort((left, right) => {
    const leftTimestamp = left.timestamp ?? 0
    const rightTimestamp = right.timestamp ?? 0

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp
    }

    return left.id - right.id
  })
}

function decorateMiniMessages(messages: MessageItem[]) {
  return sortMiniMessages(messages).map((message, index, list) => {
    const nextMessage = list[index + 1]
    const previousMessage = list[index - 1]
    const isGroupThread = message.threadType === "group"
    const senderChangedFromPrevious = !previousMessage
      || previousMessage.isMine
      || previousMessage.senderId !== message.senderId
    const senderChangedToNext = !nextMessage
      || nextMessage.isMine !== message.isMine
      || (isGroupThread && !message.isMine && nextMessage.senderId !== message.senderId)

    return {
      ...message,
      isLast: senderChangedToNext,
      showAuthor: isGroupThread && !message.isMine && Boolean(message.authorName) && senderChangedFromPrevious,
      showTime: !previousMessage || Math.abs((message.timestamp ?? 0) - (previousMessage.timestamp ?? 0)) > 1800,
    }
  })
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

export function useChatWidgetVM(
  repository: MessagesRepository = createApiMessagesRepository(),
) {
  const { t } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const currentAuthUserStore = useCurrentAuthUserStore()
  const uploadPolicyStore = useUploadPolicyStore()

  function getUploadValidationMessage(result: UploadValidationResult) {
    if (result.valid) {
      return ""
    }

    if (result.code === "too-large") {
      return t("uploadValidation.tooLarge", {
        name: result.fileName,
        maxSize: result.maxSizeLabel,
      })
    }

    if (result.code === "empty-file") {
      return t("uploadValidation.emptyFile", { name: result.fileName })
    }

    return t("uploadValidation.unsupportedType", { name: result.fileName })
  }

  function validateAndReportMessageFile(file: File) {
    const validation = validateMessageAttachment(file, uploadPolicyStore.policy)
    if (validation.valid) {
      return true
    }

    toast.add({
      title: t("uploadValidation.title"),
      description: getUploadValidationMessage(validation),
      color: "error",
    })
    return false
  }
  const currentOwnerId = computed(() => currentAuthUserStore.user?.id ?? 0)
  const currentOwnerKey = computed(() => currentOwnerId.value > 0 ? `user:${currentOwnerId.value}` : "anonymous")
  const inboxAsyncDataKey = computed(() => `navigation:chat-widget:inbox:${currentOwnerKey.value}`)
  const tagsAsyncDataKey = computed(() => `navigation:chat-widget:tags:${currentOwnerKey.value}`)

  function storageKey(segment: string) {
    return `cache:chat-widget:${currentOwnerKey.value}:${segment}`
  }

  const activeTab = ref<ChatWidgetTab>("contacts")
  const search = ref("")
  const activeSendTagFilter = ref("")
  const sendTo = ref("")
  const sendMessage = ref("")
  const attachFile = ref<File | null>(null)
  const attachFilePreviewUrl = ref<string | null>(null)
  watch(attachFile, (newFile) => {
    if (attachFilePreviewUrl.value) {
      URL.revokeObjectURL(attachFilePreviewUrl.value)
      attachFilePreviewUrl.value = null
    }
    if (newFile && newFile.type.startsWith("image/")) {
      attachFilePreviewUrl.value = URL.createObjectURL(newFile)
    }
  })
  const selectedSendRecipientIds = ref<number[]>([])

  const miniChatAutoOpenVersion = ref(0)
  const miniChatSessions = ref<MiniChatSession[]>([])
  const launchedContacts = ref<MessageContact[]>([])
  const isSendingQuick = ref(false)
  const isUpdatingTags = ref(false)
  const socket = shallowRef<Socket | null>(null)
  const connectingRealtime = ref(false)
  const socketOwnerId = ref(0)
  const refreshTimer = shallowRef<number | null>(null)
  const isInboxRefreshPaused = ref(false)
  const unreadSnapshot = shallowRef<Map<string, { unreadCount: number, preview: string }>>(new Map())
  const hasUnreadSnapshot = ref(false)
  const pendingMiniThreadRequests = new Map<string, Promise<MessageThread>>()
  const cachedThreads = new Map<string, MessageThread>()

  function miniThreadRequestKey(contactId: string, includeReactions: boolean) {
    return `${currentOwnerKey.value}:${contactId}:${includeReactions ? "with-reactions" : "fast"}`
  }

  function fetchMiniThread(contact: MessageContact, includeReactions = false) {
    const requestKey = miniThreadRequestKey(contact.id, includeReactions)
    const pending = pendingMiniThreadRequests.get(requestKey)

    if (pending) {
      return pending
    }

    const request = repository
      .getThread(contact, { includeReactions })
      .finally(() => pendingMiniThreadRequests.delete(requestKey))

    pendingMiniThreadRequests.set(requestKey, request)
    return request
  }

  function cacheMiniThread(contactId: string, thread: MessageThread) {
    cachedThreads.set(contactId, thread)

    if (!import.meta.client) {
      return
    }

    try {
      sessionStorage.setItem(storageKey(`thread:${contactId}`), JSON.stringify(thread))
    }
    catch {}
  }

  async function prefetchMiniThread(contact: MessageContact) {
    if (
      cachedThreads.has(contact.id)
      || pendingMiniThreadRequests.has(miniThreadRequestKey(contact.id, false))
    ) {
      return
    }

    const requestOwnerKey = currentOwnerKey.value

    try {
      const thread = await fetchMiniThread(contact)
      if (requestOwnerKey === currentOwnerKey.value) {
        cacheMiniThread(contact.id, thread)
      }
    }
    catch {
      // Prefetch is best-effort; opening the chat will retry normally.
    }
  }

  function prefetchRecentMiniThreads() {
    for (const contact of allContacts.value.slice(0, 2)) {
      void prefetchMiniThread(contact)
    }
  }

  const hasResolvedInitialInboxRequest = ref(false)
  const {
    data: inbox,
    status: inboxStatus,
    refresh: refreshInboxData,
    clear: clearInboxData,
  } = useAsyncData(
    inboxAsyncDataKey,
    async () => {
      const requestOwnerKey = currentOwnerKey.value
      const data = await repository.getInbox()
      if (import.meta.client && requestOwnerKey === currentOwnerKey.value) {
        try {
          sessionStorage.setItem(storageKey("inbox"), JSON.stringify(data))
        }
        catch {}
      }
      return data
    },
    {
      default: () => {
        if (import.meta.client) {
          try {
            const saved = sessionStorage.getItem(storageKey("inbox"))
            if (saved) {
              return JSON.parse(saved)
            }
          }
          catch {}
        }
        return []
      },
    },
  )

  watch(inboxStatus, (status) => {
    if (status === "success" || status === "error") {
      hasResolvedInitialInboxRequest.value = true
    }
  }, { immediate: true })

  const {
    data: messageTags,
    refresh: refreshTagsData,
    clear: clearTagsData,
  } = useAsyncData<MessageTagsPayload>(
    tagsAsyncDataKey,
    async () => {
      const requestOwnerKey = currentOwnerKey.value
      const data = await repository.getTags()
      if (import.meta.client && requestOwnerKey === currentOwnerKey.value) {
        try {
          sessionStorage.setItem(storageKey("tags"), JSON.stringify(data))
        }
        catch {}
      }
      return data
    },
    {
      default: () => {
        if (import.meta.client) {
          try {
            const saved = sessionStorage.getItem(storageKey("tags"))
            if (saved) {
              return JSON.parse(saved)
            }
          }
          catch {}
        }
        return { labels: [], contacts: [] }
      },
    },
  )

  const allContacts = computed(() => {
    const contacts = new Map<string, MessageContact>()

    for (const contact of launchedContacts.value) {
      contacts.set(contact.id, contact)
    }

    for (const contact of inbox.value ?? []) {
      if (contact.type === "user" || contact.type === "group") {
        contacts.set(contact.id, contact)
      }
    }

    return [...contacts.values()]
  })

  const presenceUserIds = computed(() =>
    getMessagePresenceUserIds([
      ...allContacts.value,
      ...(messageTags.value?.contacts ?? []),
    ]),
  )

  const userContacts = computed(() => {
    const taggedByUserId = new Map(
      (messageTags.value?.contacts ?? [])
        .map(contact => [contact.userId ?? 0, contact] as const)
        .filter(([id]) => id > 0),
    )

    return sortUserInboxContacts(allContacts.value
      .filter(contact => contact.type === "user")
      .map(contact => mergeContactTags(contact, taggedByUserId.get(contact.userId ?? 0))))
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

  const activeMiniSession = computed(() =>
    miniChatSessions.value.find(session => !session.minimized) ?? miniChatSessions.value[0] ?? null,
  )
  const activeMiniContact = computed(() =>
    activeMiniSession.value
      ? allContacts.value.find(contact => contact.id === activeMiniSession.value?.contactId) ?? null
      : null,
  )
  const miniChatOpen = computed(() => miniChatSessions.value.length > 0)
  const miniChatMessage = computed({
    get: () => activeMiniSession.value?.message ?? "",
    set: (value: string) => {
      if (activeMiniSession.value) {
        activeMiniSession.value.message = value
      }
    },
  })
  const miniAttachFile = computed({
    get: () => activeMiniSession.value?.attachFile ?? null,
    set: (value: File | null) => {
      if (activeMiniSession.value) {
        activeMiniSession.value.attachFile = value
      }
    },
  })
  const miniMessages = computed<MessageItem[]>(() =>
    activeMiniSession.value ? decorateMiniMessages(activeMiniSession.value.thread.messages) : [],
  )
  const isLoadingThread = computed(() => Boolean(activeMiniSession.value?.isLoading))
  const isSendingMini = computed(() => Boolean(activeMiniSession.value?.isSending))
  const miniChatSessionsView = computed<MiniChatSessionView[]>(() => {
    const sessions: MiniChatSessionView[] = []

    for (const session of miniChatSessions.value) {
      const contact = allContacts.value.find(item => item.id === session.contactId) ?? null

      if (!contact) {
        continue
      }

      sessions.push(Object.assign(session, {
        contact,
        messages: decorateMiniMessages(session.thread.messages),
        canSend: Boolean(contact)
          && (session.message.trim().length > 0 || Boolean(session.attachFile))
          && !session.isSending,
      }))
    }

    return sessions
  })

  const visibleSendRecipientIds = computed(() =>
    sendCandidates.value
      .map(contact => contact.userId ?? 0)
      .filter(id => id > 0),
  )

  const allVisibleSendRecipientsSelected = computed(() =>
    visibleSendRecipientIds.value.length > 0
    && visibleSendRecipientIds.value.every(id => selectedSendRecipientIds.value.includes(id)),
  )

  const isLoadingInbox = computed(() =>
    inboxStatus.value === "pending" && !hasResolvedInitialInboxRequest.value,
  )
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
      contacts.map(contact => [contact.id, {
        unreadCount: contact.unreadCount ?? 0,
        preview: contact.preview ?? "",
      }]),
    )
    hasUnreadSnapshot.value = true
  }

  function findNewIncomingContact(contacts = allContacts.value) {
    if (!hasUnreadSnapshot.value) {
      return null
    }

    const previous = unreadSnapshot.value

    return contacts.find((contact) => {
      const prev = previous.get(contact.id)
      if (!prev) {
        const isMine = contact.preview?.startsWith("Bạn:") || contact.preview?.startsWith("You:")
        return contact.preview && !isMine
      }

      const unreadCount = contact.unreadCount ?? 0
      const preview = contact.preview ?? ""

      const unreadIncreased = unreadCount > prev.unreadCount
      const isMine = preview.startsWith("Bạn:") || preview.startsWith("You:")
      const previewChanged = preview !== prev.preview && !isMine

      return unreadIncreased || previewChanged
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

  function setSelectedSendRecipientIds(userIds: number[]) {
    const availableIds = new Set(
      sendRecipientSource.value
        .map(contact => contact.userId ?? 0)
        .filter(id => id > 0),
    )

    selectedSendRecipientIds.value = [...new Set(
      userIds.filter(id => Number.isInteger(id) && availableIds.has(id)),
    )]
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

  function setUserContactOnline(userId: number, online: boolean) {
    if (userId <= 0) {
      return
    }

    const updateContacts = (contacts: MessageContact[]) =>
      contacts.map(contact =>
        contact.type === "user" && contact.userId === userId
          ? { ...contact, isOnline: online }
          : contact,
      )

    inbox.value = updateContacts(inbox.value ?? [])
    launchedContacts.value = updateContacts(launchedContacts.value)

    if (messageTags.value) {
      messageTags.value = {
        ...messageTags.value,
        contacts: updateContacts(messageTags.value.contacts ?? []),
      }
    }
  }

  async function refreshFromIncomingMessage() {
    if (isInboxRefreshPaused.value) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    if (isInboxRefreshPaused.value) {
      return
    }

    await refreshInboxSafely({ silent: true })

    const incomingContact = findNewIncomingContact()
    updateUnreadSnapshot()

    await refreshAllMiniThreads({ silent: true })

    if (!incomingContact) {
      return
    }

    await openMiniChat(incomingContact)
    miniChatAutoOpenVersion.value += 1
  }

  function getSessionContact(session: MiniChatSession) {
    return allContacts.value.find(contact => contact.id === session.contactId) ?? null
  }

  function findMiniSession(contactId: string) {
    return miniChatSessions.value.find(session => session.contactId === contactId) ?? null
  }

  async function refreshMiniThread(session = activeMiniSession.value, options?: { silent?: boolean }) {
    const contact = session ? getSessionContact(session) : null

    if (!contact) {
      if (session) {
        session.thread = createEmptyThread()
      }
      return
    }

    const shouldShowLoading = !options?.silent && session.thread.messages.length === 0
    if (shouldShowLoading) {
      session.isLoading = true
    }

    try {
      const requestOwnerKey = currentOwnerKey.value
      const incomingThread = await fetchMiniThread(
        contact,
        true,
      )
      if (requestOwnerKey !== currentOwnerKey.value) {
        return
      }
      if (session.thread.messages.length === 0) {
        session.thread = incomingThread
      }
      else {
        const incomingTexts = new Set(incomingThread.messages.filter(m => m.isMine).map(m => m.text))
        const incomingMessageIds = new Set(incomingThread.messages.map(message => message.id))
        const currentMessages = session.thread.messages.filter(msg => {
          if (msg.id < 0 && incomingTexts.has(msg.text)) {
            return false
          }

          // The server is authoritative for persisted messages, including
          // reactions received from another tab or device. Keep only local
          // optimistic messages that have not reached the server yet.
          return !incomingMessageIds.has(msg.id)
        })

        const merged = [...currentMessages, ...incomingThread.messages]
        const seen = new Set<number>()
        const unique = merged.filter((msg) => {
          if (seen.has(msg.id)) {
            return false
          }
          seen.add(msg.id)
          return true
        })
        unique.sort((a, b) => {
          const aTime = a.timestamp ?? 0
          const bTime = b.timestamp ?? 0
          if (aTime !== bTime) {
            return aTime - bTime
          }
          return a.id - b.id
        })
        session.thread.messages = unique
        session.thread.pinnedMessages = incomingThread.pinnedMessages
        session.thread.typing = incomingThread.typing
      }

      if (import.meta.client) {
        cacheMiniThread(contact.id, session.thread)
      }
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
        session.isLoading = false
      }
    }
  }

  async function refreshAllMiniThreads(options?: { silent?: boolean }) {
    await Promise.all(miniChatSessions.value.map(session => refreshMiniThread(session, options)))
  }

  async function loadOlderMiniMessages(contactId: string) {
    const session = findMiniSession(contactId)
    const contact = session ? getSessionContact(session) : null
    const firstMessageId = session?.thread.messages[0]?.id

    if (!session || !contact || !firstMessageId || session.isLoadingMore) {
      return
    }

    session.isLoadingMore = true

    try {
      const olderThread = await repository.getThread(contact, {
        beforeId: firstMessageId,
        includeReactions: true,
      })

      if (olderThread.messages.length > 0) {
        const merged = [...olderThread.messages, ...session.thread.messages]
        const seen = new Set<number>()
        const unique = merged.filter((msg) => {
          if (seen.has(msg.id)) {
            return false
          }
          seen.add(msg.id)
          return true
        })

        unique.sort((a, b) => {
          const aTime = a.timestamp ?? 0
          const bTime = b.timestamp ?? 0
          if (aTime !== bTime) {
            return aTime - bTime
          }
          return a.id - b.id
        })

        session.thread.messages = unique
      }
    }
    catch {
      toast.add({
        title: t("navigation.chatWidget.threadErrorTitle"),
        description: t("navigation.chatWidget.threadErrorDescription"),
        color: "error",
      })
    }
    finally {
      session.isLoadingMore = false
    }
  }

  async function openMiniChat(contact: MessageContact) {
    const existingSession = findMiniSession(contact.id)

    if (existingSession) {
      existingSession.minimized = false
      existingSession.openedAt = Date.now()
      miniChatSessions.value = [
        existingSession,
        ...miniChatSessions.value.filter(session => session.contactId !== contact.id),
      ]
      await refreshMiniThread(existingSession)
      return
    }

    let cachedThread = cachedThreads.get(contact.id)
    if (!cachedThread && import.meta.client) {
      try {
        const saved = sessionStorage.getItem(storageKey(`thread:${contact.id}`))
        if (saved) {
          cachedThread = JSON.parse(saved)
          if (cachedThread) {
            cachedThreads.set(contact.id, cachedThread)
          }
        }
      }
      catch {}
    }
    if (cachedThread) {
      cachedThread = {
        ...cachedThread,
        pinnedMessages: cachedThread.pinnedMessages ?? [],
      }
    }

    const nextSession: MiniChatSession = {
      contactId: contact.id,
      message: "",
      attachFile: null,
      thread: cachedThread ?? createEmptyThread(),
      isLoading: false,
      isLoadingMore: false,
      isSending: false,
      minimized: false,
      openedAt: Date.now(),
      sendQueue: [],
    }

    miniChatSessions.value = [
      nextSession,
      ...miniChatSessions.value,
    ].slice(0, MAX_MINI_CHAT_SESSIONS)
    await refreshMiniThread(nextSession)
  }

  function ensureProductSellerContact(request: ProductChatLaunchRequest) {
    const existingContact = allContacts.value.find(contact =>
      contact.type === "user" && contact.userId === request.sellerId,
    )

    if (existingContact) {
      return existingContact
    }

    const contact: MessageContact = {
      id: `user:${request.sellerId}`,
      name: request.sellerName,
      status: "",
      isOnline: false,
      avatarUrl: "",
      tab: "user",
      type: "user",
      preview: "",
      time: "",
      unreadCount: 0,
      userId: request.sellerId,
    }

    launchedContacts.value = [
      contact,
      ...launchedContacts.value.filter(item => item.id !== contact.id),
    ]

    return contact
  }

  const {
    request: chatLaunchRequest,
    consumeRequest: consumeChatLaunchRequest,
    openMessagesConversation: openRequestedMessagesConversation,
    setWidgetReady: setChatWidgetReady,
  } = useChatWidgetLauncher()

  async function openRequestedProductChat(request: ProductChatLaunchRequest) {
    const contact = ensureProductSellerContact(request)
    const openingChat = openMiniChat(contact)

    const session = findMiniSession(contact.id)
    if (session) {
      session.productDraft = request.product
      session.productSuggestions = request.suggestions
        .map(suggestion => suggestion.trim())
        .filter(Boolean)
      session.message = ""
      session.minimized = false
      session.openedAt = Date.now()
    }

    miniChatAutoOpenVersion.value += 1
    await openingChat

    if (chatLaunchRequest.value?.requestId !== request.requestId) {
      return
    }

    consumeChatLaunchRequest(request.requestId)
  }

  watch(chatLaunchRequest, (request) => {
    if (request) {
      void openRequestedProductChat(request).catch(() => {
        consumeChatLaunchRequest(request.requestId)
        openRequestedMessagesConversation(request)
      })
    }
  }, { immediate: true, flush: "post" })

  function closeMiniChat(contactId = activeMiniSession.value?.contactId ?? "") {
    miniChatSessions.value = miniChatSessions.value.filter(session => session.contactId !== contactId)
  }

  function minimizeMiniChat(contactId = activeMiniSession.value?.contactId ?? "") {
    const session = findMiniSession(contactId)

    if (session) {
      session.minimized = true
    }
  }

  function restoreMiniChat(contactId: string) {
    const session = findMiniSession(contactId)

    if (session) {
      session.minimized = false
      session.openedAt = Date.now()
      miniChatSessions.value = [
        session,
        ...miniChatSessions.value.filter(item => item.contactId !== contactId),
      ]
    }
  }

  async function sendMessageToContact(contact: MessageContact, draft: MessageSendDraft, session = activeMiniSession.value) {
    await repository.sendMessage(contact, draft)
    await Promise.all([
      refreshInboxSafely({ silent: true }),
      session ? refreshMiniThread(session, { silent: true }) : refreshAllMiniThreads({ silent: true }),
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

    if (attachFile.value && !validateAndReportMessageFile(attachFile.value)) {
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

      if (result.invalidFile === 1) {
        toast.add({
          title: t("uploadValidation.title"),
          description: t("pages.messagesPage.invalidFileTooLarge"),
          color: "error",
        })
        return
      }

      if (result.invalidFile === 2) {
        toast.add({
          title: t("uploadValidation.title"),
          description: t("pages.messagesPage.invalidFileType"),
          color: "error",
        })
        return
      }

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

  async function processMiniSendQueue(session: MiniChatSession, contact: MessageContact) {
    if (!session.sendQueue || session.sendQueue.length === 0 || session.isSending) {
      return
    }

    const draft = session.sendQueue[0]
    session.isSending = true

    try {
      const uploadedRecord = draft.record
        ? await uploadRecordDraft(draft.record)
        : null

      const createdMessages = await repository.sendMessage(contact, {
        text: draft.text,
        file: draft.file,
        record: uploadedRecord,
      })

      const realMsg = createdMessages?.[0]
      if (realMsg) {
        session.thread.messages = session.thread.messages.map(msg =>
          msg.id === draft.tempId ? { ...realMsg, isLast: msg.isLast } : msg
        )

        const contactInInbox = inbox.value.find(c => c.id === contact.id)
        if (contactInInbox) {
          contactInInbox.preview = getMessageLocationMeta(realMsg)
            ? t("pages.messagesPage.locationSharedPreview")
            : realMsg.text || (realMsg.mediaType ? `[${realMsg.mediaType}]` : "")
          contactInInbox.time = realMsg.time || t("navigation.chatWidget.justNow") || "Vừa xong"
        }
      } else {
        session.thread.messages = session.thread.messages.filter(msg => msg.id !== draft.tempId)
      }

      void refreshInboxSafely({ silent: true })

      if (import.meta.client) {
        cachedThreads.set(contact.id, session.thread)
        try {
          sessionStorage.setItem(storageKey(`thread:${contact.id}`), JSON.stringify(session.thread))
        }
        catch {}
      }

      session.sendQueue.shift()
    }
    catch {
      toast.add({
        title: t("navigation.chatWidget.sendErrorTitle"),
        description: t("navigation.chatWidget.sendErrorDescription"),
        color: "error",
      })
      session.thread.messages = session.thread.messages.filter(msg => msg.id !== draft.tempId)
      session.sendQueue.shift()
    }
    finally {
      session.isSending = false
      void processMiniSendQueue(session, contact)
    }
  }

  async function sendMiniMessage(options?: { contactId?: string, record?: MessageRecordDraft | null, textOverride?: string }) {
    const session = options?.contactId ? findMiniSession(options.contactId) : activeMiniSession.value
    const contact = session ? getSessionContact(session) : null
    const text = options?.textOverride ?? session?.message.trim() ?? ""
    const recordDraft = options?.record ?? null

    if (!session || !contact || (!text && !session.attachFile && !recordDraft)) {
      return
    }

    if (session.attachFile && !validateAndReportMessageFile(session.attachFile)) {
      return
    }

    if (!session.sendQueue) {
      session.sendQueue = []
    }

    const tempId = -Math.floor(Math.random() * 1000000)
    let mediaType: MessageItem["mediaType"] = undefined
    let mediaName = ""

    if (session.attachFile) {
      mediaName = session.attachFile.name
      const fileType = session.attachFile.type
      if (fileType.startsWith("image/")) mediaType = "image"
      else if (fileType.startsWith("video/")) mediaType = "video"
      else if (fileType.startsWith("audio/")) mediaType = "audio"
      else if (fileType.includes("gif")) mediaType = "gif"
      else mediaType = "file"
    }
    else if (recordDraft) {
      mediaType = "record"
      mediaName = recordDraft.fileName
    }

    const optimisticMessage: MessageItem = {
      id: tempId,
      text,
      isMine: true,
      time: t("navigation.chatWidget.sendingStatus") || "Đang gửi...",
      timestamp: Math.floor(Date.now() / 1000),
      mediaName,
      mediaType,
      mediaUrl: recordDraft ? recordDraft.previewUrl : session.attachFile ? URL.createObjectURL(session.attachFile) : undefined,
    }

    session.thread.messages = [...session.thread.messages, optimisticMessage]

    const contactInInbox = inbox.value.find(c => c.id === contact.id)
    if (contactInInbox) {
      contactInInbox.preview = getMessageLocationMeta({ text })
        ? t("pages.messagesPage.locationSharedPreview")
        : text || (mediaType ? `[${mediaType}]` : "")
      contactInInbox.time = t("navigation.chatWidget.sendingStatus") || "Đang gửi..."
    }

    session.sendQueue.push({
      tempId,
      text,
      file: session.attachFile,
      record: recordDraft,
    })

    session.message = ""
    if (session.attachFilePreviewUrl) {
      URL.revokeObjectURL(session.attachFilePreviewUrl)
      session.attachFilePreviewUrl = null
    }
    session.attachFile = null

    void processMiniSendQueue(session, contact)
  }

  async function reactToMiniMessage(messageId: number, reaction: FeedStoryReactionType) {
    if (!messageId || messageId <= 0) {
      return null
    }

    const result = await repository.reactToMessage({
      messageId,
      reaction,
    })

    miniChatSessions.value = miniChatSessions.value.map(session => ({
      ...session,
      thread: {
        ...session.thread,
        messages: session.thread.messages.map(message =>
          message.id === messageId
            ? { ...message, selectedReaction: result.reaction }
            : message,
        ),
      },
    }))

    for (const session of miniChatSessions.value) {
      if (session.thread.messages.some(message => message.id === messageId)) {
        cacheMiniThread(session.contactId, session.thread)
      }
    }

    return result
  }

  async function deleteMiniMessage(messageId: number) {
    if (!messageId || messageId <= 0) {
      return null
    }

    const result = await repository.deleteMessage({ messageId })

    miniChatSessions.value = miniChatSessions.value.map(session => ({
      ...session,
      thread: {
        ...session.thread,
        messages: session.thread.messages.map(message =>
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
      },
    }))

    return result
  }

  async function toggleMiniMessagePin(contactId: string, message: MessageItem) {
    const session = findMiniSession(contactId)
    const contact = session ? getSessionContact(session) : null
    const pinned = session?.thread.pinnedMessages.find(item => item.id === message.id)

    if (!session || !contact || message.isDeleted || message.id <= 0 || (pinned && !pinned.canUnpin)) {
      return null
    }

    const result = await repository.setMessagePin(contact, {
      messageId: message.id,
      pinned: !pinned,
    })
    if (pinned) {
      session.thread.pinnedMessages = session.thread.pinnedMessages.filter(item => item.id !== message.id)
    }
    await refreshMiniThread(session, { silent: true })
    return result
  }

  function onMiniFile(event: Event, contactId = activeMiniSession.value?.contactId ?? "") {
    const input = event.target as HTMLInputElement
    const session = contactId ? findMiniSession(contactId) : activeMiniSession.value
    const file = input.files?.[0] ?? null

    input.value = ""

    if (file && !validateAndReportMessageFile(file)) {
      return
    }

    if (session) {
      if (session.attachFilePreviewUrl) {
        URL.revokeObjectURL(session.attachFilePreviewUrl)
        session.attachFilePreviewUrl = null
      }
      session.attachFile = file
      if (file && file.type.startsWith("image/")) {
        session.attachFilePreviewUrl = URL.createObjectURL(file)
      }
    }
  }

  function clearMiniFile(contactId = activeMiniSession.value?.contactId ?? "") {
    const session = contactId ? findMiniSession(contactId) : activeMiniSession.value
    if (session) {
      if (session.attachFilePreviewUrl) {
        URL.revokeObjectURL(session.attachFilePreviewUrl)
      }
      session.attachFile = null
      session.attachFilePreviewUrl = null
    }
  }

  function clearMiniProductDraft(contactId = activeMiniSession.value?.contactId ?? "") {
    const session = contactId ? findMiniSession(contactId) : activeMiniSession.value

    if (session) {
      session.productDraft = null
      session.productSuggestions = []
    }
  }

  async function createTagLabel(input: { name: string, color: string }) {
    if (isUpdatingTags.value) {
      return false
    }

    isUpdatingTags.value = true

    try {
      const result = await repository.createTagLabel(input)
      await refreshTagsData()
      return result.ok
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.multiNetworkErrorTitle"),
        description: t("pages.messagesPage.multiNetworkErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      isUpdatingTags.value = false
    }
  }

  async function updateTagLabel(input: { tagId: number, name: string, color: string }) {
    if (input.tagId <= 0 || isUpdatingTags.value) {
      return false
    }

    isUpdatingTags.value = true

    try {
      const result = await repository.updateTagLabel(input)
      await refreshTagsData()
      return result.ok
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.multiNetworkErrorTitle"),
        description: t("pages.messagesPage.multiNetworkErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      isUpdatingTags.value = false
    }
  }

  async function deleteTagLabel(tagId: number) {
    if (tagId <= 0 || isUpdatingTags.value) {
      return false
    }

    isUpdatingTags.value = true

    try {
      const result = await repository.deleteTagLabel({ tagId })
      await refreshTagsData()
      return result.ok
    }
    finally {
      isUpdatingTags.value = false
    }
  }

  async function updateContactTags(contact: MessageContact, nextTagIds: number[]) {
    const userId = contact.userId ?? 0

    if (userId <= 0 || isUpdatingTags.value) {
      return false
    }

    const availableTagIds = new Set(messageTagLabels.value.map(tag => tag.id))
    const currentTagIds = new Set(
      (contact.tags ?? [])
        .map(tag => tag.id)
        .filter(tagId => availableTagIds.has(tagId)),
    )
    const selectedTagIds = new Set(
      nextTagIds
        .map(tagId => Number(tagId))
        .filter(tagId => Number.isFinite(tagId) && availableTagIds.has(tagId)),
    )
    const tagsToAttach = [...selectedTagIds].filter(tagId => !currentTagIds.has(tagId))
    const tagsToDetach = [...currentTagIds].filter(tagId => !selectedTagIds.has(tagId))

    if (tagsToAttach.length === 0 && tagsToDetach.length === 0) {
      return true
    }

    isUpdatingTags.value = true

    try {
      const results = await Promise.all([
        ...tagsToAttach.map(tagId => repository.attachTag({ userId, tagId })),
        ...tagsToDetach.map(tagId => repository.detachTag({ userId, tagId })),
      ])

      await refreshTagsData()
      return results.every(result => result.ok)
    }
    catch {
      await refreshTagsData()
      toast.add({
        title: t("pages.messagesPage.multiNetworkErrorTitle"),
        description: t("pages.messagesPage.multiNetworkErrorDescription"),
        color: "error",
      })
      return false
    }
    finally {
      isUpdatingTags.value = false
    }
  }

  function onFile(event: Event) {
    const input = event.target as HTMLInputElement
    const nextFile = input.files?.[0] ?? null
    input.value = ""

    if (nextFile && !validateAndReportMessageFile(nextFile)) {
      return
    }

    attachFile.value = nextFile
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
      if (!isInboxRefreshPaused.value) {
        void refreshFromIncomingMessage()
      }
      if (!socket.value) {
        void connectRealtime()
      }
    }, INBOX_REFRESH_INTERVAL_MS)
  }

  function setInboxRefreshPaused(paused: boolean) {
    isInboxRefreshPaused.value = paused
  }

  function stopRefreshTimer() {
    if (!import.meta.client || !refreshTimer.value) {
      return
    }

    window.clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }

  function disconnectRealtime() {
    const realtimeSocket = socket.value
    socket.value = null
    socketOwnerId.value = 0

    if (realtimeSocket) {
      realtimeSocket.removeAllListeners()
      realtimeSocket.disconnect()
    }
  }

  async function connectRealtime() {
    const ownerId = currentOwnerId.value

    if (!import.meta.client || ownerId <= 0 || connectingRealtime.value) {
      return
    }

    if (socket.value && socketOwnerId.value === ownerId) {
      return
    }

    if (socket.value) {
      disconnectRealtime()
    }

    connectingRealtime.value = true

    try {
      const auth = await repository.getRealtimeToken()

      if (ownerId !== currentOwnerId.value || !auth.enabled || !auth.token || !auth.url) {
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
        if (ownerId !== currentOwnerId.value) {
          realtimeSocket.disconnect()
          return
        }

        watchMessagePresenceUsers(realtimeSocket, presenceUserIds.value)

        const sessionHash = useCookie("user_id").value
        if (sessionHash) {
          realtimeSocket.emit("join", { user_id: sessionHash })
        }
      })

      realtimeSocket.on("messages:count", () => {
        if (ownerId === currentOwnerId.value) {
          void refreshFromIncomingMessage()
        }
      })

      realtimeSocket.on("message:presence", (payload: unknown) => {
        if (ownerId !== currentOwnerId.value) {
          return
        }

        const presence = normalizeMessagePresenceEvent(payload)

        if (presence) {
          setUserContactOnline(presence.userId, presence.online)
        }
      })

      realtimeSocket.on("disconnect", (reason) => {
        if (reason === "io client disconnect" && socket.value === realtimeSocket) {
          socket.value = null
          socketOwnerId.value = 0
        }
        else if (reason === "io server disconnect" && ownerId === currentOwnerId.value) {
          realtimeSocket.connect()
        }
      })

      realtimeSocket.on("connect_error", () => {
        // Socket.IO keeps retrying; the refresh timer remains the data fallback.
      })

      socket.value = realtimeSocket
      socketOwnerId.value = ownerId
    }
    catch {
      socket.value = null
      socketOwnerId.value = 0
    }
    finally {
      connectingRealtime.value = false
    }
  }

  async function resetForOwnerChange(ownerId: number) {
    disconnectRealtime()
    hasResolvedInitialInboxRequest.value = false
    pendingMiniThreadRequests.clear()
    cachedThreads.clear()
    launchedContacts.value = []
    miniChatSessions.value.forEach((session) => {
      if (import.meta.client && session.attachFilePreviewUrl) {
        URL.revokeObjectURL(session.attachFilePreviewUrl)
      }
    })
    miniChatSessions.value = []
    clearQuickSendForm()
    unreadSnapshot.value = new Map()
    hasUnreadSnapshot.value = false
    clearInboxData()
    clearTagsData()

    if (ownerId <= 0) {
      return
    }

    await Promise.allSettled([
      refreshInboxData(),
      refreshTagsData(),
    ])

    if (ownerId !== currentOwnerId.value) {
      return
    }

    updateUnreadSnapshot(allContacts.value)
    prefetchRecentMiniThreads()
    await connectRealtime()
  }

  watch(currentOwnerId, (ownerId, previousOwnerId) => {
    if (ownerId !== previousOwnerId) {
      void resetForOwnerChange(ownerId)
    }
  }, { flush: "sync" })

  watch([allContacts, messageTags], ([contacts, tagsPayload]) => {
    miniChatSessions.value = miniChatSessions.value.filter(session =>
      contacts.some(contact => contact.id === session.contactId),
    )

    const availableUserIds = new Set(
      [...contacts, ...(tagsPayload?.contacts ?? [])]
        .map(contact => contact.userId ?? 0)
        .filter(id => id > 0),
    )
    selectedSendRecipientIds.value = selectedSendRecipientIds.value.filter(id => availableUserIds.has(id))

    const contactIds = new Set(contacts.map(contact => contact.id))
    unreadSnapshot.value = new Map(
      [...unreadSnapshot.value.entries()].filter(([contactId]) => contactIds.has(contactId)),
    )
  })

  watch(
    presenceUserIds,
    userIds => watchMessagePresenceUsers(socket.value, userIds),
    { deep: true },
  )

  watch([activeSendTagFilter, sendCandidates], async ([tagFilter]) => {
    if (!tagFilter) {
      return
    }

    await nextTick()
    selectedSendRecipientIds.value = visibleSendRecipientIds.value
  }, { flush: "post" })

  onMounted(() => {
    void uploadPolicyStore.hydrate()
    setChatWidgetReady(true)
    startRefreshTimer()
    void refreshInboxSafely().then(() => {
      if (!hasUnreadSnapshot.value && allContacts.value.length > 0) {
        updateUnreadSnapshot(allContacts.value)
      }
      prefetchRecentMiniThreads()
    })
    void connectRealtime()

    // Fallback watcher in case initial loading or cache is empty
    if (!hasUnreadSnapshot.value) {
      const unwatch = watch(inboxStatus, (status) => {
        if (status === "success" && allContacts.value.length > 0) {
          updateUnreadSnapshot(allContacts.value)
          unwatch()
        }
      })
    }
  })

  onBeforeUnmount(() => {
    setChatWidgetReady(false)
    stopRefreshTimer()

    disconnectRealtime()

    if (attachFilePreviewUrl.value) {
      URL.revokeObjectURL(attachFilePreviewUrl.value)
    }
    miniChatSessions.value.forEach((session) => {
      if (session.attachFilePreviewUrl) {
        URL.revokeObjectURL(session.attachFilePreviewUrl)
      }
    })
  })

  return {
    activeTab,
    search,
    activeSendTagFilter,
    setInboxRefreshPaused,
    sendTo,
    sendMessage,
    attachFile,
    attachFilePreviewUrl,
    allVisibleSendRecipientsSelected,
    sendCandidates,
    selectedSendRecipientIds,
    selectedSendRecipients,
    filteredContacts,
    filteredGroups,
    onlineCount,
    miniChatOpen,
    miniChatSessions: miniChatSessionsView,
    miniChatAutoOpenVersion,
    miniChatMessage,
    miniAttachFile,
    activeMiniContact,
    miniMessages,
    isLoadingInbox,
    isLoadingThread,
    isSendingQuick,
    isUpdatingTags,
    isSendingMini,
    canSendQuickMessage,
    canSendMiniMessage,
    buildPresenceLabel,
    buildPreviewLabel,
    messageTagLabels,
    clearSendRecipients,
    createTagLabel,
    updateTagLabel,
    deleteTagLabel,
    updateContactTags,
    setSelectedSendRecipientIds,
    toggleAllVisibleSendRecipients,
    toggleSendRecipient,
    openMiniChat,
    prefetchMiniThread,
    closeMiniChat,
    minimizeMiniChat,
    restoreMiniChat,
    sendQuickMessage,
    sendMiniMessage,
    reactToMiniMessage,
    deleteMiniMessage,
    toggleMiniMessagePin,
    onMiniFile,
    clearMiniFile,
    clearMiniProductDraft,
    onFile,
    clearFile,
    openFullMessages,
    openMessagesTab,
    loadOlderMiniMessages,
  }
}
