import type { ChatMessage, MessageContact, MessageConversation, MessageTab } from "../../domain/types/message.types"
import { markConversationTails } from "../../domain/services/message-thread.service"

type Translate = (key: string, params?: Record<string, unknown>) => string

export function createMockMessageTabs(t: Translate): MessageTab[] {
  return [
    { id: "group", label: t("pages.messagesPage.sendMultiple"), icon: "i-ph-user-list-fill" },
    { id: "user", label: t("pages.messagesPage.users"), icon: "i-ph-user-circle-fill" },
    { id: "teams", label: t("pages.messagesPage.teams"), icon: "i-ph-users-three-fill" },
  ]
}

export function createMockMessageContacts(t: Translate): MessageContact[] {
  return [
    { id: "ngocktokyo", name: "Ngocktokyo", status: t("pages.messagesPage.activeNow"), isOnline: true, avatarUrl: "https://i.pravatar.cc/150?u=101" },
    { id: "dung1", name: "dung1", status: t("pages.messagesPage.activeOneHourAgo"), isOnline: false, avatarUrl: "https://i.pravatar.cc/150?u=102" },
    { id: "dung2", name: "dung2", status: t("pages.messagesPage.activeNow"), isOnline: true, avatarUrl: "https://i.pravatar.cc/150?u=103" },
    { id: "tien", name: "tien", status: t("pages.messagesPage.activeYesterday"), isOnline: false, avatarUrl: "https://i.pravatar.cc/150?u=104" },
  ]
}

export function createMockMessageConversation(t: Translate, participant?: MessageContact): MessageConversation {
  const contact = participant ?? createMockMessageContacts(t)[0]
  const messages: ChatMessage[] = [
    { id: "msg-1", text: t("pages.messagesPage.messageOne"), isMine: false, time: t("pages.messagesPage.messageTimeOne"), showTime: true, avatar: contact.avatarUrl },
    { id: "msg-2", text: t("pages.messagesPage.messageTwo"), isMine: false, avatar: contact.avatarUrl },
    { id: "msg-3", text: t("pages.messagesPage.messageThree"), isMine: true },
    { id: "msg-4", text: t("pages.messagesPage.messageFour"), isMine: true },
    { id: "msg-5", text: t("pages.messagesPage.messageFive"), isMine: false, time: t("pages.messagesPage.messageTimeTwo"), showTime: true, avatar: contact.avatarUrl },
    { id: "msg-6", text: t("pages.messagesPage.messageSix"), isMine: false, avatar: contact.avatarUrl },
    { id: "msg-7", text: t("pages.messagesPage.messageSeven"), isMine: true, time: t("pages.messagesPage.messageTimeThree"), showTime: true },
  ]

  return {
    id: `conversation-${contact.id}`,
    participant: contact,
    messages: markConversationTails(messages),
    isTyping: contact.isOnline,
  }
}
