// English description: Shared backend helpers and mappers for Nuxt messages API routes.

import { createDecipheriv } from "node:crypto"
import { createError, getQuery, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import type {
  MessageContact,
  MessageItem,
  MessageThread,
  MessageThreadType,
} from "../../../src/messages/domain/types/messages.types"

type BackendEntity = Record<string, unknown>

type BackendInboxResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendUserThreadResponse = {
  api_status?: number | string
  messages?: BackendEntity[]
  typing?: number | string
  errors?: {
    error_text?: string
  }
}

type BackendCollectionResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type MessageThreadQuery = {
  type: MessageThreadType
  userId?: number
  groupId?: number
  pageId?: number
  recipientId?: number
  beforeId?: number
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0)
  return Number.isFinite(normalized) ? normalized : 0
}

const isTruthy = (value: unknown) =>
  value === true
  || value === 1
  || value === "1"
  || value === "yes"
  || value === "true"

const asRecord = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as BackendEntity
    : {}

const asArray = (value: unknown): BackendEntity[] =>
  Array.isArray(value)
    ? value.map(item => asRecord(item))
    : []

const firstString = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }

  return ""
}

const createOpenSslKey = (value: string) => {
  const key = Buffer.alloc(16)
  Buffer.from(value).copy(key)
  return key
}

const decryptMessageText = (value: unknown, timestamp: unknown) => {
  const cipherText = asString(value)
  const timeKey = asString(timestamp)

  if (!cipherText || !timeKey) {
    return cipherText
  }

  try {
    const decipher = createDecipheriv("aes-128-ecb", createOpenSslKey(timeKey), null)
    decipher.setAutoPadding(true)

    return Buffer.concat([
      decipher.update(cipherText, "base64"),
      decipher.final(),
    ]).toString("utf8").trim()
  }
  catch {
    return cipherText
  }
}

const buildContactPreview = (message: BackendEntity) =>
  decryptMessageText(message.text, message.time)
  || firstString(message, ["media", "type_two", "type"])

const buildContactMembers = (entity: BackendEntity) =>
  asArray(entity.parts)
    .map(part => firstString(part, ["name", "username"]))
    .filter(Boolean)

const buildContactId = (type: MessageThreadType, numericId: number, extra?: number) =>
  type === "page"
    ? `${type}:${numericId}:${extra ?? 0}`
    : `${type}:${numericId}`

const buildUserStatus = (entity: BackendEntity) =>
  firstString(entity, ["lastseen", "lastseen_time_text", "lastseen_text"])

const buildGroupStatus = (entity: BackendEntity) => {
  const memberCount = buildContactMembers(entity).length
  return memberCount > 0 ? `${memberCount}` : ""
}

const buildPageStatus = (entity: BackendEntity) =>
  firstString(entity, ["page_title", "category_name", "phone", "website"])

const mapMessageContact = (
  entity: BackendEntity,
  currentUserId: number,
): MessageContact | null => {
  const type = asString(entity.chat_type) as MessageThreadType
  const lastMessage = asRecord(entity.last_message)

  if (type === "user") {
    const userId = asNumber(entity.user_id)

    if (userId <= 0) {
      return null
    }

    return {
      id: buildContactId("user", userId),
      name: firstString(entity, ["name", "username"]) || `User ${userId}`,
      status: buildUserStatus(entity),
      isOnline: asNumber(entity.lastseen) > (Math.floor(Date.now() / 1000) - 60),
      avatarUrl: firstString(entity, ["avatar", "avatar_full"]),
      tab: "user",
      preview: buildContactPreview(lastMessage),
      time: firstString(lastMessage, ["time_text"]),
      unreadCount: asNumber(entity.message_count),
      members: [firstString(entity, ["name", "username"])].filter(Boolean),
      type: "user",
      userId,
    }
  }

  if (type === "group") {
    const groupId = asNumber(entity.group_id)

    if (groupId <= 0) {
      return null
    }

    const members = buildContactMembers(entity)

    return {
      id: buildContactId("group", groupId),
      name: firstString(entity, ["group_name", "name"]) || `Group ${groupId}`,
      status: buildGroupStatus(entity),
      isOnline: false,
      avatarUrl: firstString(entity, ["avatar", "avatar_full"]),
      tab: "group",
      preview: buildContactPreview(lastMessage),
      time: firstString(lastMessage, ["time_text"]),
      unreadCount: asNumber(entity.message_count),
      members,
      type: "group",
      groupId,
      memberCount: members.length,
    }
  }

  if (type === "page") {
    const pageId = asNumber(entity.page_id)
    const recipientId = asNumber(asRecord(lastMessage.to_data).user_id)

    if (pageId <= 0 || recipientId <= 0) {
      return null
    }

    return {
      id: buildContactId("page", pageId, recipientId),
      name: firstString(entity, ["page_title", "name", "page_name"]) || `Page ${pageId}`,
      status: buildPageStatus(entity),
      isOnline: false,
      avatarUrl: firstString(entity, ["avatar", "avatar_full"]),
      tab: "user",
      preview: buildContactPreview(lastMessage),
      time: firstString(lastMessage, ["time_text"]),
      unreadCount: 0,
      members: [
        firstString(asRecord(lastMessage.to_data), ["name", "username"]),
      ].filter(Boolean),
      type: "page",
      pageId,
      recipientId,
    }
  }

  return null
}

const mapThreadMessage = (
  entity: BackendEntity,
  currentUserId: number,
  fallbackAvatar = "",
): MessageItem => {
  const timestamp = asNumber(entity.time)
  const userData = asRecord(entity.user_data)
  const messageUser = asRecord(entity.messageUser)

  return {
    id: asNumber(entity.id),
    text: decryptMessageText(entity.text, timestamp),
    isMine: asNumber(entity.from_id) === currentUserId || asString(entity.position).startsWith("right"),
    time: firstString(entity, ["time_text"]),
    avatar: firstString(userData, ["avatar", "avatar_full"])
      || firstString(messageUser, ["avatar", "avatar_full"])
      || fallbackAvatar,
    timestamp,
  }
}

export const decorateThreadMessages = (messages: MessageItem[]) =>
  messages.map((message, index, list) => {
    const nextMessage = list[index + 1]
    const previousMessage = list[index - 1]

    return {
      ...message,
      isLast: !nextMessage || nextMessage.isMine !== message.isMine,
      showTime: !previousMessage || Math.abs((message.timestamp ?? 0) - (previousMessage.timestamp ?? 0)) > 1800,
    }
  })

export async function fetchInboxContacts(event: H3Event) {
  const currentUser = await getBackendCurrentUser(event)
  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendInboxResponse, Record<string, unknown>>(
      "get_chats",
      {
        data_type: "users,groups,pages",
        user_limit: 30,
        group_limit: 30,
        page_limit: 30,
      },
    ),
    "Unable to load inbox.",
  )

  return (response.data ?? [])
    .map(entity => mapMessageContact(entity, asNumber(currentUser.user_id)))
    .filter(Boolean) as MessageContact[]
}

export function readThreadQuery(event: H3Event): MessageThreadQuery {
  const query = getQuery(event)
  const type = asString(query.type) as MessageThreadType

  if (!["user", "group", "page"].includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid message thread type is required.",
    })
  }

  return {
    type,
    userId: asNumber(query.userId),
    groupId: asNumber(query.groupId),
    pageId: asNumber(query.pageId),
    recipientId: asNumber(query.recipientId),
    beforeId: asNumber(query.beforeId),
  }
}

export async function fetchMessageThread(
  event: H3Event,
  input: MessageThreadQuery,
): Promise<MessageThread> {
  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const client = createBackendApiClient(event)

  if (input.type === "user") {
    if (!input.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A user thread requires userId.",
      })
    }

    const response = assertBackendApiSuccess(
      await client.post<BackendUserThreadResponse, Record<string, unknown>>(
        "get_user_messages",
        {
          recipient_id: input.userId,
          limit: 40,
          before_message_id: input.beforeId || undefined,
        },
      ),
      "Unable to load user messages.",
    )

    return {
      messages: decorateThreadMessages(
        (response.messages ?? []).map(message =>
          mapThreadMessage(message, currentUserId),
        ),
      ),
      typing: isTruthy(response.typing),
    }
  }

  if (input.type === "group") {
    if (!input.groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A group thread requires groupId.",
      })
    }

    const response = assertBackendApiSuccess(
      await client.post<BackendCollectionResponse, Record<string, unknown>>(
        "group_chat",
        {
          type: "fetch_messages",
          id: input.groupId,
          limit: 40,
          before_message_id: input.beforeId || undefined,
        },
      ),
      "Unable to load group messages.",
    )

    return {
      messages: decorateThreadMessages(
        (response.data ?? []).map(message =>
          mapThreadMessage(message, currentUserId),
        ),
      ),
      typing: false,
    }
  }

  if (!input.pageId || !input.recipientId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A page thread requires pageId and recipientId.",
    })
  }

  const response = assertBackendApiSuccess(
    await client.post<BackendCollectionResponse, Record<string, unknown>>(
      "page_chat",
      {
        type: "fetch",
        page_id: input.pageId,
        recipient_id: input.recipientId,
        limit: 40,
        before: input.beforeId || undefined,
      },
    ),
    "Unable to load page messages.",
  )

  return {
    messages: decorateThreadMessages(
      (response.data ?? []).map(message =>
        mapThreadMessage(message, currentUserId),
      ),
    ),
    typing: false,
  }
}

export async function sendMessageToThread(
  event: H3Event,
  input: MessageThreadQuery & { text: string },
) {
  const client = createBackendApiClient(event)
  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const messageHash = `${Date.now()}`

  if (input.type === "user") {
    if (!input.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A user thread requires userId.",
      })
    }

    const response = assertBackendApiSuccess(
      await client.post<{ api_status?: number | string, message_data?: BackendEntity[] }, Record<string, unknown>>(
        "send-message",
        {
          user_id: input.userId,
          text: input.text,
          message_hash_id: messageHash,
        },
      ),
      "Unable to send user message.",
    )

    return decorateThreadMessages(
      (response.message_data ?? []).map(message =>
        mapThreadMessage(message, currentUserId),
      ),
    )
  }

  if (input.type === "group") {
    if (!input.groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A group thread requires groupId.",
      })
    }

    const response = assertBackendApiSuccess(
      await client.post<BackendCollectionResponse, Record<string, unknown>>(
        "group_chat",
        {
          type: "send",
          id: input.groupId,
          text: input.text,
          message_hash_id: messageHash,
        },
      ),
      "Unable to send group message.",
    )

    return decorateThreadMessages(
      (response.data ?? []).map(message =>
        mapThreadMessage(message, currentUserId),
      ),
    )
  }

  if (!input.pageId || !input.recipientId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A page thread requires pageId and recipientId.",
    })
  }

  const response = assertBackendApiSuccess(
    await client.post<BackendCollectionResponse, Record<string, unknown>>(
      "page_chat",
      {
        type: "send",
        page_id: input.pageId,
        recipient_id: input.recipientId,
        text: input.text,
        message_hash_id: messageHash,
      },
    ),
    "Unable to send page message.",
  )

  return decorateThreadMessages(
    (response.data ?? []).map(message =>
      mapThreadMessage(message, currentUserId),
    ),
  )
}
