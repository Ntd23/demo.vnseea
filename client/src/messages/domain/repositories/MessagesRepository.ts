// Description: Declares the frontend repository contract for inbox, thread, and single or multi-send message flows.

import type {
  MessageContact,
  MessageItem,
  MessageThread,
  MultiMessageSendResult,
} from "../types/messages.types"

export interface MessagesRepository {
  getInbox(): Promise<MessageContact[]>
  getThread(contact: MessageContact, options?: { beforeId?: number }): Promise<MessageThread>
  sendMessage(contact: MessageContact, text: string): Promise<MessageItem[]>
  sendMultiMessage(input: {
    recipientIds: number[]
    text: string
    file?: File | null
  }): Promise<MultiMessageSendResult>
}
