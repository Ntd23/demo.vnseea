// Description: Declares the frontend repository contract for inbox, thread, and single or multi-send message flows.

import type {
  MessageActionResult,
  MessageContact,
  MessageItem,
  MessageSendDraft,
  MessageThread,
  MultiMessageSendResult,
} from "../types/messages.types"

export interface MessagesRepository {
  getInbox(): Promise<MessageContact[]>
  getThread(contact: MessageContact, options?: { beforeId?: number }): Promise<MessageThread>
  sendMessage(contact: MessageContact, input: MessageSendDraft): Promise<MessageItem[]>
  sendMultiMessage(input: {
    recipientIds: number[]
    text: string
    file?: File | null
  }): Promise<MultiMessageSendResult>
  markAllAsRead(): Promise<MessageActionResult>
  deleteConversation(contact: MessageContact): Promise<MessageActionResult>
  createGroup(input: {
    name: string
    recipientIds: number[]
  }): Promise<MessageActionResult>
}
