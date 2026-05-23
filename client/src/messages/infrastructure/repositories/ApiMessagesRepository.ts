// Description: Implements the messages repository against Nuxt server API bridges.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { MessagesRepository } from "../../domain/repositories/MessagesRepository"
import type {
  MessageActionResult,
  MessageContact,
  MessageItem,
  MessageSendDraft,
  MessageTagsPayload,
  MessageThread,
  MultiMessageSendResult,
} from "../../domain/types/messages.types"

const MESSAGES_API = {
  createGroup: "messages/group",
  deleteConversation: "messages/delete",
  markAllAsRead: "messages/read",
  tags: "messages/tags",
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

const createSingleSendBody = (
  contact: MessageContact,
  input: MessageSendDraft,
) => {
  const thread = createThreadQuery(contact)
  const text = input.text.trim()

  if (input.file) {
    const formData = new FormData()

    formData.append("type", String(thread.type))
    formData.append("text", text)

    if (thread.userId) formData.append("userId", String(thread.userId))
    if (thread.groupId) formData.append("groupId", String(thread.groupId))
    if (thread.pageId) formData.append("pageId", String(thread.pageId))
    if (thread.recipientId) formData.append("recipientId", String(thread.recipientId))

    formData.append("file", input.file, input.file.name)

    return formData
  }

  return {
    ...thread,
    text,
  }
}

export function createApiMessagesRepository(): MessagesRepository {
  const client = useNuxtApiClient()

  return {
    async getInbox() {
      return await client.get<MessageContact[]>(apiRoutes.messages.conversations)
    },
    async getTags() {
      return await client.get<MessageTagsPayload>(apiRoutes.messages.tags)
    },
    async getThread(contact: MessageContact, options?: { beforeId?: number }) {
      return await client.get<MessageThread>(
        apiRoutes.messages.thread,
        createThreadQuery(contact, options?.beforeId),
      )
    },
    async sendMessage(contact: MessageContact, input: MessageSendDraft) {
      return await client.post<MessageItem[], FormData | Record<string, unknown>>(
        apiRoutes.messages.send,
        createSingleSendBody(contact, input),
      )
    },
    async sendMultiMessage(input) {
      return await client.post<MultiMessageSendResult, FormData | Record<string, unknown>>(
        apiRoutes.messages.multi,
        createMultiSendBody(input),
      )
    },
    async createTagLabel(input) {
      return await client.post<MessageActionResult, Record<string, unknown>>(MESSAGES_API.tags, {
        action: "create",
        name: input.name,
        color: input.color,
      })
    },
    async deleteTagLabel(input) {
      return await client.post<MessageActionResult, Record<string, unknown>>(MESSAGES_API.tags, {
        action: "delete",
        tagId: input.tagId,
      })
    },
    async attachTag(input) {
      return await client.post<MessageActionResult, Record<string, unknown>>(MESSAGES_API.tags, {
        action: "attach",
        userId: input.userId,
        tagId: input.tagId,
      })
    },
    async detachTag(input) {
      return await client.post<MessageActionResult, Record<string, unknown>>(MESSAGES_API.tags, {
        action: "detach",
        userId: input.userId,
        tagId: input.tagId,
      })
    },
    async markAllAsRead() {
      return await client.post<MessageActionResult>(MESSAGES_API.markAllAsRead)
    },
    async deleteConversation(contact) {
      return await client.post<MessageActionResult, Record<string, unknown>>(
        MESSAGES_API.deleteConversation,
        createThreadQuery(contact),
      )
    },
    async createGroup(input) {
      return await client.post<MessageActionResult, Record<string, unknown>>(
        MESSAGES_API.createGroup,
        {
          name: input.name,
          recipientIds: normalizeRecipientIds(input.recipientIds),
        },
      )
    },
  }
}
