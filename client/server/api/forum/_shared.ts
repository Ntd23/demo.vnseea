// English description: Maps backend PHP forum catalogs, members, searches, messages, and mutations into domain shapes.
import { createError, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry"
import type {
  ForumCatalog,
  ForumMember,
  ForumMemberList,
  ForumMessage,
  ForumMessageList,
  ForumMutationResult,
  ForumReply,
  ForumReplyPayload,
  ForumReplyUpdatePayload,
  ForumSearchQuery,
  ForumSearchResult,
  ForumSummaryForum,
  ForumSummarySection,
  ForumThread,
  ForumThreadDetail,
  ForumThreadList,
  ForumThreadPayload,
  ForumThreadUpdatePayload,
} from "../../../src/forum/domain/types/forum.types"

type BackendEntity = Record<string, unknown>

type BackendForumResponse = {
  api_status?: number | string
  can_create?: boolean
  sections?: BackendEntity[]
  members?: BackendEntity[]
  messages?: BackendEntity[]
  forum?: BackendEntity
  threads?: BackendEntity[]
  thread?: BackendEntity
  reply?: BackendEntity
  result_type?: string
  target_thread_id?: number | string | null
  target_forum_id?: number | string | null
  deleted_id?: number | string | null
  has_more?: boolean
  next_offset?: number | string | null
  errors?: {
    error_text?: string
  }
}

const assertForumBackendApiSuccess = (
  response: BackendForumResponse,
  fallbackMessage: string,
) => {
  const apiStatus = Number(response.api_status ?? 0)
  const backendMessage = response.errors?.error_text ?? fallbackMessage
  const isUnauthorized = apiStatus === 401 || /not authorized|access_token|login is required/i.test(backendMessage)

  if (isUnauthorized || apiStatus === 403 || apiStatus === 404 || apiStatus >= 500) {
    throw createError({
      statusCode: isUnauthorized ? 401 : apiStatus,
      statusMessage: backendMessage,
      data: response,
    })
  }

  return assertBackendApiSuccess(response, fallbackMessage)
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const asBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true"

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

const stripForumMarkup = (value: string) =>
  stripHtml(
    value
      .replace(/\[(\/)?[a-z]+(?:=[^\]]+)?\]/gi, " ")
      .replace(/&nbsp;/g, " "),
  )

const createInitials = (value: string, fallback = "VN") => {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return initials || fallback
}

const createProfileUrl = (user: BackendEntity) => {
  const username = asString(user.username)
  return username ? appRoutes.profile(username) : asString(user.url)
}

const formatBackendTimestamp = (value: unknown) => {
  const numeric = asNumber(value)

  if (!numeric) {
    return asString(value)
  }

  const timestamp = numeric > 9999999999 ? numeric : numeric * 1000
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return asString(value)
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const mapForum = (item: BackendEntity, sectionId: number): ForumSummaryForum => ({
  id: asNumber(item.id),
  sectionId,
  title: asString(item.name_lang || item.name),
  description: asString(item.description_lang || item.description),
  posts: asNumber(item.posts),
  url: `/forum?fid=${asNumber(item.id)}`,
})

const mapSection = (item: BackendEntity): ForumSummarySection => {
  const id = asNumber(item.id)

  return {
    id,
    title: asString(item.section_name_lang || item.section_name),
    description: asString(item.description_lang || item.description),
    forums: Array.isArray(item.forums) ? item.forums.map(forum => mapForum(forum as BackendEntity, id)) : [],
  }
}

const mapReply = (item: BackendEntity): ForumReply => {
  const user = (item.user_data ?? {}) as BackendEntity
  const author = asString(user.name || user.username) || "Member"
  const rawSubject = asString(item.post_subject)
  const rawMessage = asString(item.post_text)

  return {
    id: asNumber(item.id),
    threadId: asNumber(item.thread_id),
    forumId: asNumber(item.forum_id),
    author,
    authorAvatarUrl: asString(user.avatar),
    authorUrl: createProfileUrl(user),
    initials: createInitials(author),
    role: asString(user.working || user.school || user.username) || author,
    subject: stripForumMarkup(rawSubject),
    message: stripForumMarkup(rawMessage),
    editableSubject: rawSubject,
    editableMessage: rawMessage,
    time: formatBackendTimestamp(item.posted_time),
    canManage: asBoolean(item.is_owner) || asBoolean(item.is_admin),
    accepted: false,
  }
}

const mapMember = (item: BackendEntity): ForumMember => {
  const username = asString(item.username)
  const name = asString(item.name || username) || "Member"

  return {
    id: asNumber(item.user_id || item.id),
    username,
    name,
    avatarUrl: asString(item.avatar),
    profileUrl: username ? appRoutes.profile(username) : asString(item.url),
    role: asNumber(item.admin) === 1 ? "admin" : "member",
    joinedAt: formatBackendTimestamp(item.joined),
    lastSeenAt: formatBackendTimestamp(item.lastseen),
    postCount: asNumber(item.forum_posts),
    referrals: asString(item.referrer) || "0",
  }
}

const mapMessage = (item: BackendEntity): ForumMessage => {
  const forum = (item.forum ?? {}) as BackendEntity
  const rawSubject = asString(item.post_subject)
  const rawMessage = asString(item.post_text)
  const threadId = asNumber(item.thread_id)
  const forumId = asNumber(item.forum_id || forum.id)

  return {
    id: asNumber(item.id),
    threadId,
    forumId,
    subject: stripForumMarkup(rawSubject),
    message: stripForumMarkup(rawMessage),
    editableSubject: rawSubject,
    editableMessage: rawMessage,
    forumLabel: asString(forum.name_lang || forum.name) || `Forum #${forumId}`,
    postedAt: formatBackendTimestamp(item.posted_time),
    url: `/forum?tab=my_messages&fid=${forumId}&tid=${threadId}`,
    canManage: true,
  }
}

const mapThread = (item: BackendEntity): ForumThread => {
  const user = (item.user_data ?? {}) as BackendEntity
  const forum = (item.forum_data || item.forum) as BackendEntity
  const author = asString(user.name || user.username) || "Member"
  const title = stripForumMarkup(asString(item.orginal_headline || item.headline))
  const body = stripForumMarkup(asString(item.post))
  const forumId = asNumber(item.forum || item.forum_id)
  const replies = Array.isArray(item.threadreplies)
    ? item.threadreplies.map(reply => mapReply(reply as BackendEntity))
    : []

  return {
    id: asNumber(item.id),
    forumId,
    title,
    section: "support",
    sectionLabel: asString(forum.name_lang || forum.name) || `Forum #${forumId}`,
    author,
    authorAvatarUrl: asString(user.avatar),
    authorUrl: createProfileUrl(user),
    authorInitials: createInitials(author),
    authorRole: asString(user.working || user.school || user.username) || author,
    status: "open",
    createdAt: formatBackendTimestamp(item.posted),
    lastPostAt: formatBackendTimestamp(item.last_post),
    views: asNumber(item.views),
    repliesCount: asNumber(item.replies) || replies.length,
    excerpt: body,
    editableTitle: asString(item.orginal_headline || item.headline),
    editableMessage: asString(item.post),
    tags: [],
    replies,
    url: `/forum?fid=${forumId}&tid=${asNumber(item.id)}`,
    canManage: asBoolean(item.is_owner) || asBoolean(item.is_admin),
  }
}

export async function fetchForumCatalog(
  event: H3Event,
  query: { q?: string; offset?: number | null; limit?: number },
): Promise<ForumCatalog> {
  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    keyword: query.q || "",
    offset: query.offset || 0,
    limit: query.limit || 20,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load forum.")

  return {
    sections: (data.sections ?? []).map(mapSection),
    canCreate: Boolean(data.can_create),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function fetchForumMembers(
  event: H3Event,
  query: { q?: string; letter?: string; offset?: number | null },
): Promise<ForumMemberList> {
  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "members",
    keyword: query.q || "",
    letter: query.letter || "",
    offset: query.offset || 0,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load forum members.")

  return {
    members: (data.members ?? []).map(mapMember),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function searchForum(
  event: H3Event,
  query: ForumSearchQuery,
): Promise<ForumSearchResult> {
  if (query.q.trim().length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: "Search terms must contain at least 4 characters.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "search",
    keyword: query.q.trim(),
    search_in: query.scope,
    search_content: query.includeContent ? 1 : 0,
    section_id: query.sectionId || 0,
    offset: query.offset || 0,
    limit: 10,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to search forum.")

  return {
    resultType: (data.result_type || query.scope) as ForumSearchResult["resultType"],
    sections: (data.sections ?? []).map(mapSection),
    threads: (data.threads ?? []).map(mapThread),
    targetThreadId: data.target_thread_id ? asNumber(data.target_thread_id) : null,
    targetForumId: data.target_forum_id ? asNumber(data.target_forum_id) : null,
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function fetchMyForumMessages(
  event: H3Event,
  query: { offset?: number | null; limit?: number },
): Promise<ForumMessageList> {
  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "my_messages",
    offset: query.offset || 0,
    limit: query.limit || 10,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load your forum messages.")

  return {
    messages: (data.messages ?? []).map(mapMessage),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function fetchForumThreads(
  event: H3Event,
  query: { forumId: number; q?: string; offset?: number | null; limit?: number },
): Promise<ForumThreadList> {
  if (!query.forumId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Forum id is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "threads",
    forum_id: query.forumId,
    keyword: query.q || "",
    offset: query.offset || 0,
    limit: query.limit || 10,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load forum threads.")

  return {
    forum: data.forum ? mapForum(data.forum, asNumber((data.forum as BackendEntity).sections)) : null,
    threads: (data.threads ?? []).map(mapThread),
    canCreate: Boolean(data.can_create),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function fetchMyForumThreads(
  event: H3Event,
  query: { q?: string; offset?: number | null; limit?: number },
): Promise<ForumThreadList> {
  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "my_threads",
    keyword: query.q || "",
    offset: query.offset || 0,
    limit: query.limit || 10,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load your forum threads.")

  return {
    forum: null,
    threads: (data.threads ?? []).map(mapThread),
    canCreate: Boolean(data.can_create),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}

export async function fetchForumThreadDetail(event: H3Event, threadId: number): Promise<ForumThreadDetail> {
  if (!threadId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thread id is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "thread_detail",
    thread_id: threadId,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to load forum thread.")

  return {
    thread: data.thread ? mapThread(data.thread) : null,
    canCreate: Boolean(data.can_create),
  }
}

export async function createForumThread(event: H3Event, payload: ForumThreadPayload): Promise<ForumMutationResult> {
  if (!payload.forumId || payload.title.trim().length < 10 || payload.message.trim().length < 32) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thread title and content are required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "create_thread",
    forum_id: payload.forumId,
    headline: payload.title.trim(),
    topicpost: payload.message.trim(),
  })
  const data = assertForumBackendApiSuccess(response, "Unable to create forum thread.")

  return {
    ok: true,
    thread: data.thread ? mapThread(data.thread) : null,
  }
}

export async function replyForumThread(event: H3Event, payload: ForumReplyPayload): Promise<ForumMutationResult> {
  const message = payload.message.trim()
  const subject = (payload.subject || message.slice(0, 80)).trim()

  if (!payload.threadId || !payload.forumId || subject.length < 10 || message.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: "Reply content is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "reply_thread",
    thread_id: payload.threadId,
    forum_id: payload.forumId,
    subject,
    content: message,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to reply to forum thread.")

  return {
    ok: true,
    reply: data.reply ? mapReply(data.reply) : null,
  }
}

export async function updateForumThread(
  event: H3Event,
  payload: ForumThreadUpdatePayload,
): Promise<ForumMutationResult> {
  if (!payload.id || payload.title.trim().length < 10 || !payload.message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thread title and content are required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "update_thread",
    thread_id: payload.id,
    headline: payload.title.trim(),
    topicpost: payload.message.trim(),
  })
  const data = assertForumBackendApiSuccess(response, "Unable to update forum thread.")

  return {
    ok: true,
    thread: data.thread ? mapThread(data.thread) : null,
  }
}

export async function deleteForumThread(event: H3Event, id: number): Promise<ForumMutationResult> {
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thread id is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "delete_thread",
    thread_id: id,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to delete forum thread.")

  return {
    ok: true,
    deletedId: data.deleted_id ? asNumber(data.deleted_id) : id,
  }
}

export async function updateForumReply(
  event: H3Event,
  payload: ForumReplyUpdatePayload,
): Promise<ForumMutationResult> {
  if (!payload.id || payload.subject.trim().length < 10 || !payload.message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Reply subject and content are required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "update_reply",
    reply_id: payload.id,
    subject: payload.subject.trim(),
    content: payload.message.trim(),
  })
  const data = assertForumBackendApiSuccess(response, "Unable to update forum reply.")

  return {
    ok: true,
    reply: data.reply ? mapReply(data.reply) : null,
  }
}

export async function deleteForumReply(event: H3Event, id: number): Promise<ForumMutationResult> {
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Reply id is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    action: "delete_reply",
    reply_id: id,
  })
  const data = assertForumBackendApiSuccess(response, "Unable to delete forum reply.")

  return {
    ok: true,
    deletedId: data.deleted_id ? asNumber(data.deleted_id) : id,
  }
}
