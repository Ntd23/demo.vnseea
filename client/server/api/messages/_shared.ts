// English description: Shared backend helpers and mappers for Nuxt messages API routes.

import { createDecipheriv } from "node:crypto"
import { createError, getHeader, getQuery, readBody, readMultipartFormData, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { createBackendWebClient } from "../../utils/backend-web-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import type {
  MessageContact,
  MessageGroupCandidate,
  MessageGroupCreateCandidate,
  MessageCreateGroupResult,
  MessageGroupDetails,
  MessageItem,
  MessageGroupMember,
  MessageTypingState,
  MessageThread,
  MessageThreadType,
  UploadedMessageRecord,
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

type BackendChatParticipantsResponse = {
  status?: number | string
  html?: string
  parts?: BackendEntity[]
  message?: string
}

type BackendChatCreateGroupResponse = {
  status?: number | string
  group_id?: number | string
  message?: string
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
  recordFile?: string
  recordName?: string
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

const stripHtml = (value: string) =>
  decodeHtmlEntities(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

const toBlobChunk = (buffer: Buffer) => new Uint8Array(buffer)

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
  if (rawType.includes("record") || /\.(mp3|m4a|wav|ogg|webm)$/i.test(media)) return "record"
  if (rawType.includes("audio")) return "audio"
  if (media) return "file"

  return undefined
}

const buildDisplayName = (entity: BackendEntity) => {
  const directName = firstString(entity, ["name"])

  if (directName) {
    return directName
  }

  const firstName = asString(entity.first_name)
  const lastName = asString(entity.last_name)
  const fullName = `${firstName} ${lastName}`.trim()

  if (fullName) {
    return fullName
  }

  return firstString(entity, ["username"])
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

const buildMemberProfileUrl = (entity: BackendEntity) => {
  const username = firstString(entity, ["username"])
  return username ? `/@${encodeURIComponent(username)}` : ""
}

const buildContactId = (type: MessageThreadType, numericId: number, extra?: number) =>
  type === "page"
    ? `${type}:${numericId}:${extra ?? 0}`
    : `${type}:${numericId}`

const buildLastSeenStatus = (entity: BackendEntity) =>
  firstString(entity, ["lastseen_status"]).toLowerCase()

const buildUserStatus = (entity: BackendEntity) => {
  const explicitStatus = buildLastSeenStatus(entity)
  const descriptiveStatus = firstString(entity, ["lastseen_time_text", "lastseen_text"])

  if (descriptiveStatus) {
    return descriptiveStatus
  }

  if (explicitStatus === "on" || explicitStatus === "online") {
    return ""
  }

  return ""
}

const buildUserOnlineState = (entity: BackendEntity, lastSeenAt: number) => {
  const explicitStatus = buildLastSeenStatus(entity)

  if (explicitStatus === "on" || explicitStatus === "online") {
    return true
  }

  if (explicitStatus === "off" || explicitStatus === "offline") {
    return false
  }

  return lastSeenAt > (Math.floor(Date.now() / 1000) - 60)
}

const buildLastSeenAt = (entity: BackendEntity) => {
  const lastSeenAt = asNumber(entity.lastseen)
  return lastSeenAt > 0 ? lastSeenAt : 0
}

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
    const lastSeenAt = buildLastSeenAt(entity)

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
      isOnline: buildUserOnlineState(entity, lastSeenAt),
      lastSeenAt: lastSeenAt || undefined,
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
  threadType: MessageThreadType,
): MessageItem => {
  const timestamp = asNumber(entity.time)
  const rawText = decryptMessageText(entity.text, timestamp)
  const callLog = parseCallLogPayload(rawText, entity)
  const userData = asRecord(entity.user_data)
  const messageUser = asRecord(entity.messageUser)
  const mediaUrl = buildMediaUrl(entity, resolveMediaUrl)
  const mediaType = inferMediaType(entity)
  const senderId = asNumber(entity.from_id)

  return {
    id: asNumber(entity.id),
    text: normalizeMessageText(decryptMessageText(entity.text, timestamp), entity),
    isMine: senderId === currentUserId || asString(entity.position).startsWith("right"),
    time: firstString(entity, ["time_text"]),
    avatar: resolveMediaUrl(firstString(userData, ["avatar", "avatar_full"])
      || firstString(messageUser, ["avatar", "avatar_full"])),
    timestamp,
    senderId,
    authorName: buildDisplayName(userData) || buildDisplayName(messageUser),
    threadType,
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

const mapGroupMember = (
  entity: BackendEntity,
  ownerId: number,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
): MessageGroupMember | null => {
  const userId = asNumber(entity.user_id)
  const name = buildDisplayName(entity)

  if (userId <= 0 || !name) {
    return null
  }

  return {
    userId,
    name,
    username: firstString(entity, ["username"]),
    avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
    profileUrl: buildMemberProfileUrl(entity),
    isOwner: userId === ownerId,
    isSelf: userId === currentUserId,
  }
}

const mapGroupDetails = (
  entity: BackendEntity,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
): MessageGroupDetails | null => {
  const groupId = asNumber(entity.group_id)
  const name = firstString(entity, ["group_name", "name"])
  const ownerId = asNumber(entity.user_id)

  if (groupId <= 0 || !name || ownerId <= 0) {
    return null
  }

  const members = asArray(entity.parts)
    .map(member => mapGroupMember(member, ownerId, currentUserId, resolveMediaUrl))
    .filter(Boolean) as MessageGroupMember[]

  members.sort((left, right) => {
    if (left.isOwner !== right.isOwner) {
      return left.isOwner ? -1 : 1
    }

    if (left.isSelf !== right.isSelf) {
      return left.isSelf ? -1 : 1
    }

    return left.name.localeCompare(right.name)
  })

  return {
    groupId,
    name,
    avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
    ownerId,
    canManage: ownerId === currentUserId || isTruthy(entity.owner),
    memberCount: members.length,
    members,
  }
}

const mapGroupCandidate = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string,
): MessageGroupCreateCandidate | null => {
  const userId = asNumber(entity.user_id)
  const name = buildDisplayName(entity)

  if (userId <= 0 || !name) {
    return null
  }

  return {
    userId,
    name,
    username: firstString(entity, ["username"]),
    avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
    profileUrl: buildMemberProfileUrl(entity),
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
    const isGroupThread = message.threadType === "group"
    const senderChangedFromPrevious = !previousMessage
      || previousMessage.isMine
      || previousMessage.senderId !== message.senderId
    const senderChangedToNext = !nextMessage
      || nextMessage.isMine !== message.isMine
      || (isGroupThread && !message.isMine && nextMessage.senderId !== message.senderId)

    return {
      ...message,
      isLast: senderChangedToNext,
      showAuthor: isGroupThread && !message.isMine && Boolean(message.authorName) && senderChangedFromPrevious,
      showTime: !previousMessage || Math.abs((message.timestamp ?? 0) - (previousMessage.timestamp ?? 0)) > 1800,
    }
  })

export async function fetchInboxContacts(event: H3Event) {
  try {
    const currentUser = await getBackendCurrentUser(event)
    const client = createBackendApiClient(event)
    const resolveMediaUrl = createBackendMediaUrlResolver(event)
    const response = await client.post<BackendInboxResponse, Record<string, unknown>>(
      "get_chats",
      {
        data_type: "users,groups,pages",
        user_limit: 30,
        group_limit: 30,
        page_limit: 30,
      },
    )

    const contacts = (response.data ?? [])
      .map(entity => mapMessageContact(entity, asNumber(currentUser.user_id), resolveMediaUrl))
      .filter(Boolean) as MessageContact[]

    return contacts
  }
  catch (error) {
    throw error
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
          mapThreadMessage(message, currentUserId, resolveMediaUrl, "user"),
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
          mapThreadMessage(message, currentUserId, resolveMediaUrl, "group"),
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
        mapThreadMessage(message, currentUserId, resolveMediaUrl, "page"),
      ),
    ),
    typing: false,
  }
}

export async function sendMessageToThread(
  event: H3Event,
  input: MultipartMessageInput,
) {
  const apiClient = createBackendApiClient(event)
  const webClient = createBackendWebClient(event)
  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const sessionHash = asString(currentUser.session_hash)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const normalizeCreatedMessages = (entities: BackendEntity[]) =>
    decorateThreadMessages(
      entities.map(message => mapThreadMessage(message, currentUserId, resolveMediaUrl, input.type)),
    )

  const createLegacyBody = (
    fields: Record<string, unknown>,
    file?: MultipartMessageInput["file"],
  ) => {
    if (!file) {
      const body = new URLSearchParams()

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null && String(value) !== "") {
          body.append(key, String(value))
        }
      }

      return body
    }

    const body = new FormData()

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null && String(value) !== "") {
        body.append(key, String(value))
      }
    }

    body.append(
      "sendMessageFile",
      new Blob([toBlobChunk(file.data)], { type: file.type || "application/octet-stream" }),
      file.filename || "attachment",
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

    if (!sessionHash) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication is required.",
      })
    }

    const legacyResponse = await webClient.postForm<{ status?: number | string }>(
      "messages",
      createLegacyBody({
        user_id: input.userId,
        textSendMessage: input.text,
        "record-file": input.recordFile,
        "record-name": input.recordName,
        hash_id: sessionHash,
      }, input.file),
      {
        s: "send_message",
        hash: sessionHash,
      },
    )

    if (asNumber(legacyResponse.status) !== 200) {
      throw createError({
        statusCode: 502,
        statusMessage: "Unable to send user message.",
      })
    }

    const response = assertBackendApiSuccess(
      await apiClient.post<BackendUserThreadResponse, Record<string, unknown>>(
        "get_user_messages",
        {
          recipient_id: input.userId,
          limit: 8,
        },
      ),
      "Unable to load the created user message.",
    )

    return normalizeCreatedMessages(response.messages ?? [])
      .filter(message => message.isMine)
      .sort((left, right) => right.id - left.id)
      .slice(0, 1)
  }

  if (input.type === "group") {
    if (!input.groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: "A group thread requires groupId.",
      })
    }

    if (!sessionHash) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication is required.",
      })
    }

    const legacyResponse = await webClient.postForm<{ status?: number | string }>(
      "messages",
      createLegacyBody({
        group_id: input.groupId,
        textSendMessage: input.text,
        "record-file": input.recordFile,
        "record-name": input.recordName,
        hash_id: sessionHash,
      }, input.file),
      {
        s: "send_message",
        hash: sessionHash,
      },
    )

    if (asNumber(legacyResponse.status) !== 200) {
      throw createError({
        statusCode: 502,
        statusMessage: "Unable to send group message.",
      })
    }

    const response = assertBackendApiSuccess(
      await apiClient.post<BackendCollectionResponse, Record<string, unknown>>(
        "group_chat",
        {
          type: "fetch_messages",
          id: input.groupId,
          limit: 8,
        },
      ),
      "Unable to load the created group message.",
    )

    return normalizeCreatedMessages(extractCollectionMessages(response))
      .filter(message => message.isMine)
      .sort((left, right) => right.id - left.id)
      .slice(0, 1)
  }

  if (!input.pageId || !input.recipientId) {
    throw createError({
      statusCode: 400,
      statusMessage: "A page thread requires pageId and recipientId.",
    })
  }

  const response = assertBackendApiSuccess(
    await apiClient.post<BackendCollectionResponse, Record<string, unknown>>(
      "page_chat",
      {
        type: "send",
        page_id: input.pageId,
        recipient_id: input.recipientId,
        text: input.text,
        message_hash_id: `${Date.now()}`,
      },
    ),
    "Unable to send page message.",
  )

  return normalizeCreatedMessages(extractCollectionMessages(response))
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
      recordFile: asString(body.recordFile),
      recordName: asString(body.recordName),
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
    recordFile: asString(fields.recordFile),
    recordName: asString(fields.recordName),
    file,
  }
}

export async function parseCreateMessageGroupBody(event: H3Event) {
  const contentType = getHeader(event, "content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    const body = await readBody<Record<string, unknown>>(event)
    const rawIds = Array.isArray(body.recipientIds)
      ? body.recipientIds
      : Array.isArray(body["recipientIds[]"])
        ? body["recipientIds[]"]
        : []

    return {
      name: asString(body.name),
      recipientIds: rawIds.map(value => asNumber(value)).filter(id => id > 0),
      avatar: null,
    }
  }

  const parts = await readMultipartFormData(event) ?? []
  const recipientIds: number[] = []
  let name = ""
  let avatar: {
    filename?: string
    type?: string
    data: Buffer
  } | null = null

  for (const part of parts) {
    if (!part.name) {
      continue
    }

    if (part.filename && part.name === "avatar") {
      avatar = {
        filename: part.filename,
        type: part.type,
        data: part.data,
      }
      continue
    }

    const value = part.data.toString()

    if (part.name === "name") {
      name = value
      continue
    }

    if (part.name === "recipientIds[]" || part.name === "recipientIds") {
      const recipientId = asNumber(value)

      if (recipientId > 0) {
        recipientIds.push(recipientId)
      }
    }
  }

  return {
    name: asString(name),
    recipientIds,
    avatar,
  }
}

export async function uploadMessageRecord(
  event: H3Event,
  input: {
    file: {
      filename?: string
      type?: string
      data: Buffer
    }
    fileName?: string
  },
): Promise<UploadedMessageRecord> {
  const webClient = createBackendWebClient(event)
  const currentUser = await getBackendCurrentUser(event)
  const sessionHash = asString(currentUser.session_hash)

  if (!input.file?.data || input.file.data.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "An audio recording file is required.",
    })
  }

  if (!sessionHash) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const formData = new FormData()
  const fileName = input.fileName || input.file.filename || "record.webm"

  formData.append("hash_id", sessionHash)
  formData.append("audio-filename", fileName)
  formData.append(
    "audio-blob",
    new Blob([toBlobChunk(input.file.data)], { type: input.file.type || "audio/webm" }),
    fileName,
  )

  const response = await webClient.postForm<{
    status?: number | string
    url?: string
    name?: string
    message?: string
  }>(
    "messages",
    formData,
    {
      s: "upload_record",
      hash: sessionHash,
    },
  )

  if (asNumber(response.status) !== 200 || !asString(response.url) || !asString(response.name)) {
    throw createError({
      statusCode: 400,
      statusMessage: asString(response.message) || "Unable to upload the message recording.",
    })
  }

  return {
    url: asString(response.url),
    name: asString(response.name),
    mimeType: input.file.type || "audio/webm",
    durationMs: 0,
  }
}

export async function updateTypingState(
  event: H3Event,
  input: {
    action: "start" | "stop" | "status"
    userId: number
  },
): Promise<MessageTypingState | { ok: boolean }> {
  const webClient = createBackendWebClient(event)
  const currentUser = await getBackendCurrentUser(event)
  const sessionHash = asString(currentUser.session_hash)

  if (!input.userId || input.userId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid userId is required for typing state updates.",
    })
  }

  if (!sessionHash) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  if (input.action === "status") {
    const response = await webClient.postForm<{
      status?: number | string
      is_typing?: number | string
    }>(
      "chat",
      {
        hash_id: sessionHash,
      },
      {
        s: "chat_side",
        user_id: input.userId,
        hash: sessionHash,
      },
    )

    return {
      enabled: asNumber(response.status) === 200,
      typing: asNumber(response.is_typing) === 200,
    }
  }

  const response = await webClient.postForm<{
    status?: number | string
  }>(
    "chat",
    {
      hash_id: sessionHash,
    },
    {
      s: input.action === "start" ? "recipient_is_typing" : "remove_typing",
      recipient_id: input.userId,
      hash: sessionHash,
    },
  )

  if (asNumber(response.status) !== 200) {
    throw createError({
      statusCode: 502,
      statusMessage: "Unable to update typing state.",
    })
  }

  return { ok: true }
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
  input: {
    name: string
    recipientIds: number[]
    avatar?: {
      filename?: string
      type?: string
      data: Buffer
    } | null
  },
): Promise<MessageCreateGroupResult> {
  const name = input.name.trim()
  const recipientIds = [...new Set(input.recipientIds.map(Number).filter(id => Number.isFinite(id) && id > 0))]
  const currentUser = await getBackendCurrentUser(event)
  const sessionHash = asString(currentUser.session_hash)
  const webClient = createBackendWebClient(event)

  if (recipientIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one group participant is required.",
    })
  }

  if (!sessionHash) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication is required.",
    })
  }

  const body = input.avatar
    ? (() => {
        const formData = new FormData()

        formData.append("group_name", name)
        formData.append("parts", recipientIds.join(","))
        formData.append(
          "avatar",
          new Blob([toBlobChunk(input.avatar!.data)], { type: input.avatar!.type || "application/octet-stream" }),
          input.avatar!.filename || "group-avatar",
        )

        return formData
      })()
    : new URLSearchParams({
        group_name: name,
        parts: recipientIds.join(","),
      })

  const response = await webClient.postForm<BackendChatCreateGroupResponse>(
    "chat",
    body,
    {
      s: "create_group",
      hash: sessionHash,
    },
  )

  const groupId = asNumber(response.group_id)
  const backendMessage = stripHtml(asString(response.message))

  if (asNumber(response.status) !== 200 || groupId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: backendMessage || "Unable to create group chat.",
      data: response,
    })
  }

  return {
    ok: true,
    groupId,
    message: backendMessage || undefined,
  }
}

export async function searchCreateMessageGroupParticipants(
  event: H3Event,
  query: string,
): Promise<MessageGroupCreateCandidate[]> {
  const keyword = query.trim()

  if (!keyword) {
    return []
  }

  const webClient = createBackendWebClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = await webClient.postForm<BackendChatParticipantsResponse>(
    "chat",
    undefined,
    {
      s: "get_parts",
      name: keyword,
    },
  )

  if (asNumber(response.status) !== 200) {
    return []
  }

  return asArray(response.parts)
    .map(entity => mapGroupCandidate(entity, resolveMediaUrl))
    .filter(Boolean) as MessageGroupCreateCandidate[]
}

export async function fetchMessageGroupDetails(
  event: H3Event,
  groupId: number,
): Promise<MessageGroupDetails> {
  if (!groupId || groupId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid groupId is required.",
    })
  }

  const currentUser = await getBackendCurrentUser(event)
  const currentUserId = asNumber(currentUser.user_id)
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendCollectionResponse, Record<string, unknown>>(
      "group_chat",
      {
        type: "get_by_id",
        id: groupId,
      },
    ),
    "Unable to load group details.",
  )

  const groupDetails = asArray(response.data)
    .map(entity => mapGroupDetails(entity, currentUserId, resolveMediaUrl))
    .find(Boolean)

  if (!groupDetails) {
    throw createError({
      statusCode: 404,
      statusMessage: "The selected group could not be found.",
    })
  }

  return groupDetails
}

export async function searchMessageGroupCandidates(
  event: H3Event,
  input: {
    groupId: number
    query: string
  },
): Promise<MessageGroupCandidate[]> {
  if (!input.groupId || input.groupId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid groupId is required.",
    })
  }

  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendCollectionResponse, Record<string, unknown>>(
      "group_chat",
      {
        type: "search_addable_users",
        id: input.groupId,
        keyword: input.query.trim(),
        limit: 12,
      },
    ),
    "Unable to search addable group members.",
  )

  return asArray(response.data)
    .map(entity => mapGroupCandidate(entity, resolveMediaUrl))
    .filter(Boolean) as MessageGroupCandidate[]
}

export async function updateMessageGroupMembers(
  event: H3Event,
  input: {
    action: "add" | "remove"
    groupId: number
    userIds: number[]
  },
) {
  const groupId = asNumber(input.groupId)
  const userIds = [...new Set(input.userIds.map(Number).filter(id => Number.isFinite(id) && id > 0))]

  if (groupId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid groupId is required.",
    })
  }

  if (userIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "At least one userId is required.",
    })
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendCollectionResponse, Record<string, unknown>>(
      "group_chat",
      {
        type: input.action === "add" ? "add_user" : "remove_user",
        id: groupId,
        parts: userIds.join(","),
      },
    ),
    input.action === "add"
      ? "Unable to add users to this group."
      : "Unable to remove users from this group.",
  )

  return {
    ok: true,
    message: asString((response as BackendEntity).message_data),
  }
}
