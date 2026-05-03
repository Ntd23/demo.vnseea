// Description: Loads inbox contacts and message threads from the Nuxt API bridge without local mock fallbacks.

import type {
  MessageContact,
  MessageItem,
  MessageTab,
  MessageTabKey,
  MessageThread,
} from "../../domain/types/messages.types"
import { createApiMessagesRepository } from "../../infrastructure/repositories/ApiMessagesRepository"

type MessageFeedbackTone = "neutral" | "success" | "warning" | "error"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) {
    return String(value[0] || "")
  }

  return typeof value === "string" ? value : ""
}

function normalizeTab(value: string): MessageTabKey {
  return value === "multi" || value === "group" ? value : "user"
}

function decorateThreadMessages(messages: MessageItem[]) {
  return messages.map((message, index, list) => {
    const nextMessage = list[index + 1]
    const previousMessage = list[index - 1]

    return {
      ...message,
      isLast: !nextMessage || nextMessage.isMine !== message.isMine,
      showTime: !previousMessage || Math.abs((message.timestamp ?? 0) - (previousMessage.timestamp ?? 0)) > 1800,
    }
  })
}

function mergeMessages(
  current: MessageItem[],
  incoming: MessageItem[],
  mode: "prepend" | "append",
) {
  const merged = mode === "prepend"
    ? [...incoming, ...current]
    : [...current, ...incoming]

  const seen = new Set<number>()

  return decorateThreadMessages(
    merged.filter((message) => {
      if (seen.has(message.id)) {
        return false
      }

      seen.add(message.id)
      return true
    }),
  )
}

export function useMessagesInbox(
  repository = createApiMessagesRepository(),
) {
  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const activeTab = ref<MessageTabKey>(normalizeTab(readQueryValue(route.query.tab)))
  const query = ref("")
  const selectedContactId = ref("")
  const selectedRecipientIds = ref<number[]>([])
  const multiText = ref("")
  const multiFile = ref<File | null>(null)
  const multiFeedback = ref<{ tone: MessageFeedbackTone, message: string } | null>(null)
  const isLoadingMore = ref(false)
  const isSending = ref(false)
  const isMultiSending = ref(false)

  const tabs = computed<MessageTab[]>(() => [
    { id: "multi", label: t("pages.messagesPage.sendMultiple"), icon: "i-ph-user-list-duotone" },
    { id: "user", label: t("pages.messagesPage.users"), icon: "i-ph-user-circle-duotone" },
    { id: "group", label: t("pages.messagesPage.groups"), icon: "i-ph-users-three-duotone" },
  ])

  const {
    data: inbox,
    status: inboxStatus,
    error: inboxError,
    refresh: refreshInbox,
  } = useAsyncData(
    "messages:inbox",
    () => repository.getInbox(),
    {
      default: () => [],
    },
  )

  const multiRecipientSource = computed(() =>
    (inbox.value ?? [])
      .filter(contact => contact.type === "user" && (contact.userId ?? 0) > 0),
  )

  const visibleContacts = computed(() => {
    const source = activeTab.value === "multi"
      ? multiRecipientSource.value
      : inbox.value ?? []

    if (activeTab.value === "multi") {
      return source
    }

    return source.filter(contact => contact.tab === activeTab.value)
  })

  const filteredContacts = computed(() =>
    visibleContacts.value.filter((contact) => {
      const normalizedQuery = query.value.trim().toLowerCase()

      if (!normalizedQuery) {
        return true
      }

      return contact.name.toLowerCase().includes(normalizedQuery)
        || contact.preview.toLowerCase().includes(normalizedQuery)
    }),
  )

  const selectedRecipients = computed(() => {
    const selectedIds = new Set(selectedRecipientIds.value)

    return multiRecipientSource.value.filter(contact =>
      selectedIds.has(contact.userId ?? 0),
    )
  })

  const visibleRecipientIds = computed(() =>
    activeTab.value === "multi"
      ? filteredContacts.value
        .map(contact => contact.userId ?? 0)
        .filter(id => id > 0)
      : [],
  )

  const allVisibleRecipientsSelected = computed(() =>
    visibleRecipientIds.value.length > 0
    && visibleRecipientIds.value.every(id => selectedRecipientIds.value.includes(id)),
  )

  const selectedContact = computed<MessageContact | null>(() => {
    if (activeTab.value === "multi") {
      return null
    }

    return filteredContacts.value.find(contact => contact.id === selectedContactId.value)
      ?? filteredContacts.value[0]
      ?? null
  })

  const {
    data: thread,
    status: threadStatus,
    error: threadError,
    refresh: refreshThread,
  } = useAsyncData(
    () => selectedContact.value ? `messages:thread:${selectedContact.value.id}` : "messages:thread:none",
    () => selectedContact.value
      ? repository.getThread(selectedContact.value)
      : Promise.resolve<MessageThread>({ messages: [], typing: false }),
    {
      watch: [selectedContact],
      default: () => ({ messages: [], typing: false }),
    },
  )

  const messages = computed(() => thread.value?.messages ?? [])
  const isTyping = computed(() => Boolean(thread.value?.typing))
  const inboxPending = computed(() => inboxStatus.value === "pending")
  const threadPending = computed(() => threadStatus.value === "pending" || isLoadingMore.value || isSending.value)
  const multiFeedbackMessage = computed(() => multiFeedback.value?.message ?? "")
  const multiFeedbackTone = computed<MessageFeedbackTone>(() => multiFeedback.value?.tone ?? "neutral")

  watch(() => route.query.tab, (value) => {
    const normalizedTab = normalizeTab(readQueryValue(value))

    if (normalizedTab !== activeTab.value) {
      activeTab.value = normalizedTab
    }
  })

  watch(activeTab, (value) => {
    const currentTab = normalizeTab(readQueryValue(route.query.tab))

    if (currentTab === value) {
      return
    }

    const nextQuery = { ...route.query }

    if (value === "user") {
      delete nextQuery.tab
    }
    else {
      nextQuery.tab = value
    }

    router.replace({ query: nextQuery })
  })

  watch(filteredContacts, (nextContacts) => {
    if (activeTab.value === "multi") {
      selectedContactId.value = ""
      return
    }

    if (!nextContacts.some(contact => contact.id === selectedContactId.value)) {
      selectedContactId.value = nextContacts[0]?.id ?? ""
    }
  }, { immediate: true })

  function showThreadError() {
    toast.add({
      title: t("pages.messagesPage.threadErrorTitle"),
      description: t("pages.messagesPage.threadErrorDescription"),
      color: "error",
    })
  }

  function setMultiFeedbackMessage(
    tone: MessageFeedbackTone,
    message: string,
  ) {
    multiFeedback.value = {
      tone,
      message,
    }
  }

  function clearMultiSelection() {
    selectedRecipientIds.value = []
  }

  function toggleRecipient(contact: MessageContact) {
    const userId = contact.userId ?? 0

    if (userId <= 0) {
      return
    }

    const nextIds = new Set(selectedRecipientIds.value)

    if (nextIds.has(userId)) {
      nextIds.delete(userId)
    }
    else {
      nextIds.add(userId)
    }

    selectedRecipientIds.value = [...nextIds]
  }

  function toggleAllVisibleRecipients() {
    const visibleIds = visibleRecipientIds.value

    if (visibleIds.length === 0) {
      return
    }

    if (allVisibleRecipientsSelected.value) {
      const visibleIdSet = new Set(visibleIds)

      selectedRecipientIds.value = selectedRecipientIds.value.filter(id => !visibleIdSet.has(id))
      return
    }

    selectedRecipientIds.value = [...new Set([
      ...selectedRecipientIds.value,
      ...visibleIds,
    ])]
  }

  async function loadThread() {
    try {
      await refreshThread()
    }
    catch {
      showThreadError()
    }
  }

  async function selectContact(contact: MessageContact) {
    if (activeTab.value === "multi") {
      toggleRecipient(contact)
      return
    }

    const shouldRefresh = activeTab.value === contact.tab
      && selectedContactId.value === contact.id

    selectedContactId.value = contact.id

    if (shouldRefresh) {
      await loadThread()
    }
  }

  async function sendMessage(text: string) {
    const contact = selectedContact.value

    if (!contact || isSending.value) {
      return
    }

    isSending.value = true

    try {
      const createdMessages = await repository.sendMessage(contact, text)
      thread.value = {
        messages: mergeMessages(messages.value, createdMessages, "append"),
        typing: false,
      }
      await refreshInbox()
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.sendErrorTitle"),
        description: t("pages.messagesPage.sendErrorDescription"),
        color: "error",
      })
    }
    finally {
      isSending.value = false
    }
  }

  async function sendMultiMessage() {
    if (isMultiSending.value) {
      return
    }

    if (selectedRecipientIds.value.length === 0) {
      setMultiFeedbackMessage("error", t("pages.messagesPage.multiMissingRecipients"))
      return
    }

    const text = multiText.value.trim()

    if (!text && !multiFile.value) {
      setMultiFeedbackMessage("error", t("pages.messagesPage.multiMissingContent"))
      return
    }

    isMultiSending.value = true
    setMultiFeedbackMessage("neutral", t("pages.messagesPage.multiSending"))

    try {
      const result = await repository.sendMultiMessage({
        recipientIds: selectedRecipientIds.value,
        text,
        file: multiFile.value,
      })

      if (result.invalidFile === 1) {
        setMultiFeedbackMessage("error", t("pages.messagesPage.invalidFileTooLarge"))
      }
      else if (result.invalidFile === 2) {
        setMultiFeedbackMessage("error", t("pages.messagesPage.invalidFileType"))
      }
      else if (result.invalidFile === 3) {
        setMultiFeedbackMessage("error", t("pages.messagesPage.invalidFileProOnly"))
      }
      else if (result.status === 200) {
        setMultiFeedbackMessage("success", t("pages.messagesPage.multiSendSuccess", {
          count: result.sentCount,
        }))
        multiText.value = ""
        multiFile.value = null
        clearMultiSelection()
      }
      else if (result.status === 207) {
        setMultiFeedbackMessage("warning", t("pages.messagesPage.multiSendPartial", {
          sent: result.sentCount,
          failed: result.failedCount,
        }))
      }
      else if (result.status === 422) {
        setMultiFeedbackMessage("error", result.error || t("pages.messagesPage.multiMissingContent"))
      }
      else if (result.status === 500) {
        setMultiFeedbackMessage("error", t("pages.messagesPage.multiSendFailed"))
      }
      else {
        setMultiFeedbackMessage("error", result.error || t("pages.messagesPage.multiUnknownStatus"))
      }

      if (result.status === 200 || result.status === 207) {
        await refreshInbox()
      }
    }
    catch {
      toast.add({
        title: t("pages.messagesPage.multiNetworkErrorTitle"),
        description: t("pages.messagesPage.multiNetworkErrorDescription"),
        color: "error",
      })
      setMultiFeedbackMessage("error", t("pages.messagesPage.multiNetworkErrorDescription"))
    }
    finally {
      isMultiSending.value = false
    }
  }

  async function loadOlderMessages() {
    const contact = selectedContact.value
    const firstMessageId = messages.value[0]?.id

    if (!contact || !firstMessageId || isLoadingMore.value) {
      return
    }

    isLoadingMore.value = true

    try {
      const olderThread = await repository.getThread(contact, { beforeId: firstMessageId })

      if (olderThread.messages.length > 0) {
        thread.value = {
          messages: mergeMessages(messages.value, olderThread.messages, "prepend"),
          typing: Boolean(thread.value?.typing),
        }
      }
    }
    catch {
      showThreadError()
    }
    finally {
      isLoadingMore.value = false
    }
  }

  return {
    activeTab,
    allVisibleRecipientsSelected,
    filteredContacts,
    inboxError,
    inboxPending,
    isMultiSending,
    isTyping,
    loadOlderMessages,
    messages,
    multiFeedbackMessage,
    multiFeedbackTone,
    multiFile,
    multiText,
    query,
    refreshInbox,
    selectedContact,
    selectedRecipientIds,
    selectedRecipients,
    selectContact,
    sendMessage,
    sendMultiMessage,
    tabs,
    threadError,
    threadPending,
    toggleAllVisibleRecipients,
  }
}
