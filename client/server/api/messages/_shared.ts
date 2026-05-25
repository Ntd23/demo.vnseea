// English description: Shared backend helpers and mappers for Nuxt messages API routes.

import { createDecipheriv } from "node:crypto"
import { createError, getHeader, getQuery, readBody, readMultipartFormData, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
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
  data?: BackendEntity[] | BackendEntity
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

type MultipartMessageInput = MessageThreadQuery & {
  text: string
  file?: {
    filename?: string
    type?: string
    data: Buffer
  } | null
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

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")

const buildCallMessageLabel = (value: string, entity: BackendEntity) => {
  const type = firstString(entity, ["type_two", "type"]).toLowerCase()
  const callLog = parseCallLogPayload(value, entity)

  if (callLog) {
    const title = callLog.call_type === "video" ? "Cuoc goi video" : "Cuoc goi thoai"
    const duration = formatCallDuration(callLog.duration)

    return duration ? `${title} - ${duration}` : title
  }

  if (type.includes("call")) {
    return type.includes("video") ? "Cuộc gọi video" : "Cuộc gọi thoại"
  }

  if (!value.startsWith("{")) {
    return ""
  }

  try {
    const payload = JSON.parse(value) as BackendEntity
    const callId = asString(payload.call_id)
    const callType = asString(payload.call_type).toLowerCase()

    if (!callId && !callType) {
      return ""
    }

    return callType.includes("video") ? "Cuộc gọi video" : "Cuộc gọi thoại"
  }
  catch {
    return ""
  }
}

const parseCallLogPayload = (value: string, entity: BackendEntity) => {
  const type = firstString(entity, ["type_two", "type"]).toLowerCase()
  const decoded = decodeHtmlEntities(value).replace(/\\"/g, "\"").trim()

  if (!type.includes("call") && !decoded.startsWith("{")) {
    return null
  }

  try {
    const payload = JSON.parse(decoded) as BackendEntity
    const callType = firstString(payload, ["call_type"]).toLowerCase()

    if (!callType && !type.includes("call")) {
      return null
    }

    return {
      call_type: callType === "video" || type.includes("video") ? "video" as const : "audio" as const,
      status: firstString(payload, ["status"]),
      duration: asNumber(payload.duration),
    }
  }
  catch {
    if (!type.includes("call")) {
      return null
    }

    return {
      call_type: type.includes("video") ? "video" as const : "audio" as const,
      status: "",
      duration: 0,
    }
  }
}

const formatCallDuration = (seconds: number) => {
  const duration = Math.max(0, Math.floor(seconds))

  if (duration <= 0) {
    return ""
  }

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const remainingSeconds = duration % 60

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
}

const normalizeMessageText = (value: string, entity: BackendEntity) => {
  const decoded = decodeHtmlEntities(value).replace(/\\"/g, "\"").trim()
  const callLabel = buildCallMessageLabel(decoded, entity)

  return callLabel || decoded
}

const extractCollectionMessages = (response: BackendCollectionResponse) => {
  const directMessages = asArray(response.data)

  if (directMessages.length > 0) {
    return directMessages
  }

  return asArray(asRecord(response.data).messages)
}

const buildProfileUrl = (entity: BackendEntity, type: MessageThreadType) => {
  if (type === "page") {
    const name = firstString(entity, ["page_name", "name"])
    return name ? `/p/${encodeURIComponent(name)}` : ""
  }

  const username = firstString(entity, ["username"])
  return username ? `/@${encodeURIComponent(username)}` : ""
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
  normalizeMessageText(decryptMessageText(message.text, message.time), message)
  || normalizeMessageText(firstString(message, ["media", "type_two", "type"]), message)

const inferMediaType = (entity: BackendEntity): MessageItem["mediaType"] | undefined => {
  const rawType = firstString(entity, ["type", "type_two"]).toLowerCase()
  const media = firstString(entity, ["media", "stickers", "media_file"]).toLowerCase()

  if (rawType.includes("gif") || media.endsWith(".gif")) return "gif"
  if (rawType.includes("image") || /\.(png|jpe?g|webp|bmp)$/i.test(media)) return "image"
  if (rawType.includes("video") || /\.(mp4|mov|webm|m4v)$/i.test(media)) return "video"
  if (rawType.includes("audio") || rawType.includes("record") || /\.(mp3|m4a|wav|ogg|webm)$/i.test(media)) return "audio"
  if (media) return "file"

  return undefined
}

const buildMediaUrl = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string,
) => {
  const source = firstString(entity, ["media", "stickers", "media_file"])
  return source ? resolveMediaUrl(source) : ""
}

const buildContactMembers = (entity: BackendEntity) =>
  asArray(entity.parts)
    .map(part => firstString(part, ["name", "username"]))
    .filter(Boolean)

const buildContactId = (type: MessageThreadType, numericId: number, extra?: number) =>
  type === "page"
    ? `${type}:${numericId}:${extra ?? 0}`
    : `${type}:${numericId}`

const buildUserStatus = (entity: BackendEntity) =>
  firstString(entity, ["lastseen_time_text", "lastseen_text", "lastseen_status"])

const buildGroupStatus = (entity: BackendEntity) => {
  const memberCount = buildContactMembers(entity).length
  return memberCount > 0 ? `${memberCount}` : ""
}

const buildPageStatus = (entity: BackendEntity) =>
  firstString(entity, ["page_title", "category_name", "phone", "website"])

const mapMessageContact = (
  entity: BackendEntity,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
): MessageContact | null => {
  const type = asString(entity.chat_type) as MessageThreadType
  const lastMessage = asRecord(entity.last_message)

  if (type === "user") {
    const userId = asNumber(entity.user_id)

    if (userId <= 0) {
      return null
    }

    const name = firstString(entity, ["name", "username"])

    if (!name) {
      return null
    }

    return {
      id: buildContactId("user", userId),
      name,
      profileUrl: buildProfileUrl(entity, "user"),
      status: buildUserStatus(entity),
      isOnline: asNumber(entity.lastseen) > (Math.floor(Date.now() / 1000) - 60),
      avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
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
    const name = firstString(entity, ["group_name", "name"])

    if (!name) {
      return null
    }

    return {
      id: buildContactId("group", groupId),
      name,
      status: buildGroupStatus(entity),
      isOnline: false,
      avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
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

    const name = firstString(entity, ["page_title", "name", "page_name"])

    if (!name) {
      return null
    }

    return {
      id: buildContactId("page", pageId, recipientId),
      name,
      profileUrl: buildProfileUrl(entity, "page"),
      status: buildPageStatus(entity),
      isOnline: false,
      avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
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
  resolveMediaUrl: (value: unknown) => string,
): MessageItem => {
  const timestamp = asNumber(entity.time)
  const rawText = decryptMessageText(entity.text, timestamp)
  const callLog = parseCallLogPayload(rawText, entity)
  const userData = asRecord(entity.user_data)
  const messageUser = asRecord(entity.messageUser)
  const mediaUrl = buildMediaUrl(entity, resolveMediaUrl)
  const mediaType = inferMediaType(entity)

  return {
    id: asNumber(entity.id),
    text: normalizeMessageText(rawText, entity),
    isMine: asNumber(entity.from_id) === currentUserId || asString(entity.position).startsWith("right"),
    time: firstString(entity, ["time_text"]),
    avatar: resolveMediaUrl(firstString(userData, ["avatar", "avatar_full"])
      || firstString(messageUser, ["avatar", "avatar_full"])),
    timestamp,
    mediaUrl,
    mediaName: firstString(entity, ["mediaFileName", "media_file_name", "filename"]),
    mediaType,
    callLog: callLog
      ? {
          type: callLog.call_type,
          status: callLog.status,
          duration: callLog.duration,
        }
      : undefined,
  }
}

const sortThreadMessages = (messages: MessageItem[]) =>
  [...messages].sort((left, right) => {
    const leftTimestamp = left.timestamp ?? 0
    const rightTimestamp = right.timestamp ?? 0

    if (leftTimestamp !== rightTimestamp) {
      return leftTimestamp - rightTimestamp
    }

    return left.id - right.id
  })

export const decorateThreadMessages = (messages: MessageItem[]) =>
  sortThreadMessages(messages).map((message, index, list) => {
    const nextMessage = list[index + 1]
    const previousMessage = list[index - 1]

    return {
      ...message,
      isLast: !nextMessage || nextMessage.isMine !== message.isMine,
      showTime: !previousMessage || Math.abs((message.timestamp ?? 0) - (previousMessage.timestamp ?? 0)) > 1800,
    }
  })

export async function fetchInboxContacts(event: H3Event) {
  console.log("[fetchInboxContacts] Initiated fetch.");
  console.log("[fetchInboxContacts] Cookies:", event.node.req.headers.cookie);
  try {
    const currentUser = await getBackendCurrentUser(event);
    console.log("[fetchInboxContacts] Current User ID:", currentUser.user_id);
    const client = createBackendApiClient(event);
    const resolveMediaUrl = createBackendMediaUrlResolver(event);
    const response = await client.post<BackendInboxResponse, Record<string, unknown>>(
      "get_chats",
      {
        data_type: "users,groups,pages",
        user_limit: 30,
        group_limit: 30,
        page_limit: 30,
      },
    );

    console.log("[fetchInboxContacts] Backend API Response status:", response.api_status);
    console.log("[fetchInboxContacts] Backend API Response data count:", response.data?.length ?? 0);

    const contacts = (response.data ?? [])
      .map(entity => mapMessageContact(entity, asNumber(currentUser.user_id), resolveMediaUrl))
      .filter(Boolean) as MessageContact[];

    console.log("[fetchInboxContacts] Mapped contacts count:", contacts.length);
    return contacts;
  } catch (err: any) {
    console.error("[fetchInboxContacts] Error occurred:", err.message, err.stack);
    throw err;
  }
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
  const resolveMediaUrl = createBackendMediaUrlResolver(event)

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
          mapThreadMessage(message, currentUserId, resolveMediaUrl),
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
        extractCollectionMessages(response).map(message =>
          mapThreadMessage(message, currentUserId, resolveMediaUrl),
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
      extractCollectionMessages(response).map(message =>
        mapThreadMessage(message, currentUserId, resolveMediaUrl),
      ),
    ),
    typing: false,
  }
}

export async function sendMessageToThread(
  event: H3Event,
  input: MultipartMessageInput,
) {
  const client = createBackendApiClient(event)
  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const messageHash = `${Date.now()}`
  const createSendBody = (fields: Record<string, unknown>) => {
    if (!input.file) {
      return fields
    }

    const body = new FormData()

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        body.append(key, String(value))
      }
    }

    body.append(
      "file",
      new Blob([input.file.data], { type: input.file.type || "application/octet-stream" }),
      input.file.filename || "attachment",
    )

    return body
  }

  if (input.type === "user") {
    if (!input.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A user thread requires userId.",
      })
    }

    const response = assertBackendApiSuccess(
      await client.post<{ api_status?: number | string, message_data?: BackendEntity[] }, FormData | Record<string, unknown>>(
        "send-message",
        createSendBody({
          user_id: input.userId,
          text: input.text,
          message_hash_id: messageHash,
        }),
      ),
      "Unable to send user message.",
    )

    return decorateThreadMessages(
      (response.message_data ?? []).map(message =>
        mapThreadMessage(message, currentUserId, resolveMediaUrl),
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
      await client.post<BackendCollectionResponse, FormData | Record<string, unknown>>(
        "group_chat",
        createSendBody({
          type: "send",
          id: input.groupId,
          text: input.text,
          message_hash_id: messageHash,
        }),
      ),
      "Unable to send group message.",
    )

    return decorateThreadMessages(
      extractCollectionMessages(response).map(message =>
        mapThreadMessage(message, currentUserId, resolveMediaUrl),
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
    await client.post<BackendCollectionResponse, FormData | Record<string, unknown>>(
      "page_chat",
      createSendBody({
        type: "send",
        page_id: input.pageId,
        recipient_id: input.recipientId,
        text: input.text,
        message_hash_id: messageHash,
      }),
    ),
    "Unable to send page message.",
  )

  return decorateThreadMessages(
    extractCollectionMessages(response).map(message =>
      mapThreadMessage(message, currentUserId, resolveMediaUrl),
    ),
  )
}

export async function parseMessageSendBody(event: H3Event): Promise<MultipartMessageInput> {
  const contentType = getHeader(event, "content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    const body = await readBody<Record<string, unknown>>(event)

    return {
      type: asString(body.type) as MessageThreadType,
      userId: asNumber(body.userId),
      groupId: asNumber(body.groupId),
      pageId: asNumber(body.pageId),
      recipientId: asNumber(body.recipientId),
      text: asString(body.text),
      file: null,
    }
  }

  const parts = await readMultipartFormData(event) ?? []
  const fields: Record<string, string> = {}
  let file: MultipartMessageInput["file"] = null

  for (const part of parts) {
    if (!part.name) {
      continue
    }

    if (part.filename && part.name === "file") {
      file = {
        filename: part.filename,
        type: part.type,
        data: part.data,
      }
      continue
    }

    fields[part.name] = part.data.toString()
  }

  return {
    type: asString(fields.type) as MessageThreadType,
    userId: asNumber(fields.userId),
    groupId: asNumber(fields.groupId),
    pageId: asNumber(fields.pageId),
    recipientId: asNumber(fields.recipientId),
    text: asString(fields.text),
    file,
  }
}

export async function markAllMessagesAsRead(event: H3Event) {
  const client = createBackendApiClient(event)
  assertBackendApiSuccess(
    await client.post<{ api_status?: number | string }>("read_chats"),
    "Unable to mark chats as read.",
  )

  return { ok: true }
}

export async function deleteMessageConversation(
  event: H3Event,
  input: MessageThreadQuery,
) {
  const client = createBackendApiClient(event)

  if (input.type === "user") {
    if (!input.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A user thread requires userId.",
      })
    }

    assertBackendApiSuccess(
      await client.post<{ api_status?: number | string, message?: string }, Record<string, unknown>>(
        "delete-conversation",
        { user_id: input.userId },
      ),
      "Unable to delete user conversation.",
    )

    return { ok: true }
  }

  if (input.type === "page") {
    if (!input.pageId || !input.recipientId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A page thread requires pageId and recipientId.",
      })
    }

    assertBackendApiSuccess(
      await client.post<{ api_status?: number | string, message?: string }, Record<string, unknown>>(
        "page_chat",
        {
          type: "delete_chat",
          page_id: input.pageId,
          recipient_id: input.recipientId,
        },
      ),
      "Unable to delete page conversation.",
    )

    return { ok: true }
  }

  if (!input.groupId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A group thread requires groupId.",
    })
  }

  assertBackendApiSuccess(
    await client.post<{ api_status?: number | string, message_data?: string }, Record<string, unknown>>(
      "group_chat",
      {
        type: "leave",
        id: input.groupId,
      },
    ),
    "Unable to leave group chat.",
  )

  return { ok: true }
}

export async function createMessageGroup(
  event: H3Event,
  input: { name: string, recipientIds: number[] },
) {
  const name = input.name.trim()
  const recipientIds = [...new Set(input.recipientIds.map(Number).filter(id => Number.isFinite(id) && id > 0))]

  if (name.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: "Group name must be at least 4 characters.",
    })
  }

  if (recipientIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one group recipient is required.",
    })
  }

  const client = createBackendApiClient(event)
  assertBackendApiSuccess(
    await client.post<{ api_status?: number | string }, Record<string, unknown>>(
      "group_chat",
      {
        type: "create",
        group_name: name,
        parts: recipientIds.join(","),
      },
    ),
    "Unable to create group chat.",
  )

  return { ok: true }
}
