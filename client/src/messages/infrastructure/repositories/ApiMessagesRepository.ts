// Description: Implements the messages repository against Nuxt server API bridges.

import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { MessagesRepository } from "../../domain/repositories/MessagesRepository"
import type {
  MessageContact,
  MessageItem,
  MessageThread,
  MultiMessageSendResult,
} from "../../domain/types/messages.types"

const messageApiRoutes = {
  inbox: "messages/inbox",
  multi: "messages/multi",
  thread: "messages/thread",
  send: "messages/send",
} as const

const createThreadQuery = (contact: MessageContact, beforeId?: number) => ({
  type: contact.type,
  userId: contact.userId,
  groupId: contact.groupId,
  pageId: contact.pageId,
  recipientId: contact.recipientId,
  beforeId,
})

const normalizeRecipientIds = (recipientIds: number[]) =>
  [...new Set(
    recipientIds
      .map(id => Number(id))
      .filter(id => Number.isFinite(id) && id > 0),
  )]

const createMultiSendBody = (input: {
  recipientIds: number[]
  text: string
  file?: File | null
}) => {
  const recipientIds = normalizeRecipientIds(input.recipientIds)

  if (input.file) {
    const formData = new FormData()

    formData.append("text", input.text)

    for (const recipientId of recipientIds) {
      formData.append("recipientIds[]", String(recipientId))
    }

    formData.append("file", input.file, input.file.name)

    return formData
  }

  return {
    recipientIds,
    text: input.text,
  }
}

export function createApiMessagesRepository(): MessagesRepository {
  const client = useNuxtApiClient()

  return {
    async getInbox() {
      return await client.get<MessageContact[]>(messageApiRoutes.inbox)
    },
    async getThread(contact: MessageContact, options?: { beforeId?: number }) {
      return await client.get<MessageThread>(
        messageApiRoutes.thread,
        createThreadQuery(contact, options?.beforeId),
      )
    },
    async sendMessage(contact: MessageContact, text: string) {
      return await client.post<MessageItem[], Record<string, unknown>>(messageApiRoutes.send, {
        ...createThreadQuery(contact),
        text,
      })
    },
    async sendMultiMessage(input) {
      return await client.post<MultiMessageSendResult, FormData | Record<string, unknown>>(
        messageApiRoutes.multi,
        createMultiSendBody(input),
      )
    },
  }
}
