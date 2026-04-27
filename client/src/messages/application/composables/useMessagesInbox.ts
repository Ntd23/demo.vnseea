import type {
  MessageContact,
  MessageItem,
  MessageTab,
  MessageTabKey,
} from "../../domain/types/messages.types"

export function useMessagesInbox() {
  const { t } = useI18n()

  const activeTab = ref<MessageTabKey>("group")
  const selectedContactId = ref(1)
  const isTyping = ref(true)

  const tabs = computed<MessageTab[]>(() => [
    { id: "group", label: t("pages.messagesPage.sendMultiple"), icon: "i-ph-user-list-fill" },
    { id: "user", label: t("pages.messagesPage.users"), icon: "i-ph-user-circle-fill" },
    { id: "teams", label: t("pages.messagesPage.teams"), icon: "i-ph-users-three-fill" },
  ])

  const contacts = computed<MessageContact[]>(() => [
    { id: 1, name: "Ngocktokyo", status: t("pages.messagesPage.activeNow"), isOnline: true, avatarUrl: "https://i.pravatar.cc/150?u=101", tab: "group" },
    { id: 2, name: "dung1", status: t("pages.messagesPage.activeOneHourAgo"), isOnline: false, avatarUrl: "https://i.pravatar.cc/150?u=102", tab: "user" },
    { id: 3, name: "dung2", status: t("pages.messagesPage.activeNow"), isOnline: true, avatarUrl: "https://i.pravatar.cc/150?u=103", tab: "user" },
    { id: 4, name: "tien", status: t("pages.messagesPage.activeYesterday"), isOnline: false, avatarUrl: "https://i.pravatar.cc/150?u=104", tab: "teams" },
  ])

  const messageMap = ref<Record<number, MessageItem[]>>({
    1: [
      { id: 1, text: t("pages.messagesPage.messageOne"), isMine: false, time: t("pages.messagesPage.messageTimeOne"), showTime: true, isLast: false },
      { id: 2, text: t("pages.messagesPage.messageTwo"), isMine: false, isLast: true },
      { id: 3, text: t("pages.messagesPage.messageThree"), isMine: true, isLast: false },
      { id: 4, text: t("pages.messagesPage.messageFour"), isMine: true, isLast: true },
      { id: 5, text: t("pages.messagesPage.messageFive"), isMine: false, time: t("pages.messagesPage.messageTimeTwo"), showTime: true, isLast: false },
      { id: 6, text: t("pages.messagesPage.messageSix"), isMine: false, isLast: true },
      { id: 7, text: t("pages.messagesPage.messageSeven"), isMine: true, time: t("pages.messagesPage.messageTimeThree"), showTime: true, isLast: true },
    ],
    2: [
      { id: 21, text: t("pages.messagesPage.messageOne"), isMine: false, time: t("pages.messagesPage.messageTimeOne"), showTime: true, isLast: true },
      { id: 22, text: t("pages.messagesPage.messageFour"), isMine: true, isLast: true },
    ],
    3: [
      { id: 31, text: t("pages.messagesPage.messageTwo"), isMine: false, time: t("pages.messagesPage.messageTimeTwo"), showTime: true, isLast: true },
      { id: 32, text: t("pages.messagesPage.messageSeven"), isMine: true, isLast: true },
    ],
    4: [
      { id: 41, text: t("pages.messagesPage.messageThree"), isMine: true, time: t("pages.messagesPage.messageTimeThree"), showTime: true, isLast: true },
      { id: 42, text: t("pages.messagesPage.messageSix"), isMine: false, isLast: true },
    ],
  })

  const filteredContacts = computed(() =>
    contacts.value.filter(contact => activeTab.value === contact.tab),
  )

  const selectedContact = computed(() =>
    filteredContacts.value.find(contact => contact.id === selectedContactId.value)
    ?? filteredContacts.value[0]
    ?? contacts.value[0],
  )

  const messages = computed(() =>
    messageMap.value[selectedContact.value?.id ?? 0] ?? [],
  )

  watch(filteredContacts, (nextContacts) => {
    if (!nextContacts.some(contact => contact.id === selectedContactId.value)) {
      selectedContactId.value = nextContacts[0]?.id ?? contacts.value[0]?.id ?? 1
    }
  }, { immediate: true })

  function selectTab(tab: MessageTabKey) {
    activeTab.value = tab
  }

  function selectContact(contact: MessageContact) {
    selectedContactId.value = contact.id
    isTyping.value = contact.isOnline
  }

  function sendMessage(text: string) {
    const contact = selectedContact.value
    if (!contact) return

    const current = messageMap.value[contact.id] ?? []
    messageMap.value[contact.id] = [
      ...current,
      {
        id: Date.now(),
        text,
        isMine: true,
        isLast: true,
        showTime: current.length % 5 === 0,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]
  }

  function loadOlderMessages() {
    const contact = selectedContact.value
    if (!contact) return

    const current = messageMap.value[contact.id] ?? []
    messageMap.value[contact.id] = [
      {
        id: Date.now() - 1,
        text: t("pages.messagesPage.messageOne"),
        isMine: false,
        showTime: true,
        time: t("pages.messagesPage.messageTimeOne"),
        isLast: false,
        avatar: contact.avatarUrl,
      },
      ...current,
    ]
  }

  return {
    activeTab,
    filteredContacts,
    isTyping,
    messages,
    selectedContact,
    selectContact,
    selectTab,
    sendMessage,
    loadOlderMessages,
    tabs,
  }
}
