import type { ChatMessage, MessageContact, MessageConversation } from "../types/message.types"

export interface MessageRepository {
  listContacts(): Promise<MessageContact[]>
  getConversation(contactId: string): Promise<MessageConversation | null>
  sendMessage(contactId: string, text: string): Promise<ChatMessage>
}
