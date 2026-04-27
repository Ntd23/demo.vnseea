import type { ChatMessage, MessageContact, MessageConversation, MessageTabKey } from "../../domain/types/message.types"
import { appendOutgoingMessage, canSendMessage } from "../../domain/services/message-thread.service"
import { createMockMessageContacts, createMockMessageConversation, createMockMessageTabs } from "../../infrastructure/mocks/messages.mock"

export function useMessagesWorkspace() {
  const { t } = useI18n()

  const infoPanelOpen = ref(false)
  const inputModel = ref("")
  const activeTab = ref<MessageTabKey>("group")
  const selectedContactId = ref("ngocktokyo")
  const loadedOlderMessages = ref(false)
  const messagesByContact = ref<Record<string, ChatMessage[]>>({})

  const tabs = computed(() => createMockMessageTabs(t))
  const contacts = computed(() => createMockMessageContacts(t))

  const selectedContact = computed(() => (
    contacts.value.find(contact => contact.id === selectedContactId.value) ?? contacts.value[0]
  ))

  const selectedConversation = computed<MessageConversation>(() => {
    const contact = selectedContact.value
    const fallback = createMockMessageConversation(t, contact)

    return {
      ...fallback,
      messages: messagesByContact.value[contact.id] ?? fallback.messages,
    }
  })

  const messages = computed(() => selectedConversation.value.messages)
  const isTyping = computed(() => selectedConversation.value.isTyping)

  function seedContactMessages(contact: MessageContact) {
    if (messagesByContact.value[contact.id]) return

    messagesByContact.value = {
      ...messagesByContact.value,
      [contact.id]: createMockMessageConversation(t, contact).messages,
    }
  }

  watch(contacts, nextContacts => {
    nextContacts.forEach(seedContactMessages)
  }, { immediate: true })

  function selectContact(contact: MessageContact) {
    selectedContactId.value = contact.id
    seedContactMessages(contact)
  }

  function sendMessage(text: string) {
    if (!canSendMessage(text)) return

    const contact = selectedContact.value
    const currentMessages = messagesByContact.value[contact.id] ?? createMockMessageConversation(t, contact).messages

    messagesByContact.value = {
      ...messagesByContact.value,
      [contact.id]: appendOutgoingMessage(currentMessages, text, {
        id: `local-${contact.id}-${Date.now()}`,
        showTime: currentMessages.length % 5 === 0,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }),
    }

    inputModel.value = ""
  }

  function toggleInfoPanel() {
    infoPanelOpen.value = !infoPanelOpen.value
  }

  function loadOlderMessages() {
    loadedOlderMessages.value = true
  }

  return {
    activeTab,
    contacts,
    infoPanelOpen,
    inputModel,
    isTyping,
    loadedOlderMessages,
    messages,
    selectedContact,
    tabs,
    loadOlderMessages,
    selectContact,
    sendMessage,
    toggleInfoPanel,
  }
}
