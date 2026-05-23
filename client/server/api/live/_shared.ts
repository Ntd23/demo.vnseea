// English description: Bridges the Nuxt live studio context to the legacy PHP LiveKit host handlers in xhr/live.php and normalizes them for the frontend.

import { createError, type H3Event } from "h3"
import { createBackendWebClient } from "../../utils/backend-web-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { normalizeBackendBaseURL } from "../../utils/backend-api-client"
import type {
  GoLiveDraft,
  LiveMutationResult,
  LiveStudioBootstrap,
  LiveStudioComment,
  LiveStudioHeartbeat,
  LiveStudioHost,
  LiveStudioSession,
} from "../../../src/live/domain/types/live.types"

type BackendEntity = Record<string, unknown>

type BackendLiveBootstrapResponse = {
  status?: number | string
  message?: string
  error?: string
  enabled?: boolean | number | string
  can_use_live?: boolean | number | string
  blocked_reason?: string
  host?: BackendEntity
  stream_name?: string
  room_name?: string
  ws_url?: string
  token?: string
  destination?: string
  current_privacy?: string
}

type BackendLiveSessionResponse = {
  status?: number | string
  message?: string
  error?: string
  post_id?: number | string
  stream_name?: string
  room_name?: string
  ws_url?: string
  token?: string
  title?: string
  description?: string
  post_url?: string
  started_at?: number | string
}

type BackendLiveHeartbeatResponse = {
  status?: number | string
  message?: string
  error?: string
  removed?: string
  count?: number | string
  viewer_count?: number | string
  still_live?: string
  heartbeat_age?: number | string
  reactions_count?: number | string
  shares_count?: number | string
  clips_count?: number | string
  comments?: BackendEntity[]
  joined?: BackendEntity[]
  left?: BackendEntity[]
}

type BackendLiveMutationResponse = {
  status?: number | string
  message?: string
  error?: string
  thumb_url?: string
}

const LIVE_DESTINATION_OPTIONS = [
  { value: "timeline", label: "Timeline" },
]

const LIVE_PRIVACY_OPTIONS = [
  { value: "0", label: "Public" },
  { value: "1", label: "Friends" },
  { value: "2", label: "Followers" },
  { value: "3", label: "Only me" },
]

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const asBoolean = (value: unknown) =>
  value === true
  || value === 1
  || value === "1"
  || value === "true"
  || value === "yes"

const asEntity = (value: unknown): BackendEntity =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as BackendEntity
    : {}

const normalizeResponse = <T extends Record<string, unknown>>(response: T | string | false | null | undefined) => {
  if (typeof response !== "string") {
    return response
  }

  try {
    return JSON.parse(response) as T
  }
  catch {
    return null
  }
}

const assertLiveWebSuccess = <T extends Record<string, unknown>>(
  response: T | string | false | null | undefined,
  fallbackMessage: string,
) => {
  const normalized = normalizeResponse(response)

  if (!normalized || typeof normalized !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: fallbackMessage,
      data: normalized,
    })
  }

  const status = asNumber(normalized.status)

  if (status >= 200 && status < 300) {
    return normalized as T
  }

  throw createError({
    statusCode: 400,
    statusMessage: asString(normalized.error || normalized.message) || fallbackMessage,
    data: normalized,
  })
}

const getBackendWebBase = (event: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event)
  return normalizeBackendBaseURL(String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase))
}

const normalizeImageUrl = (value: string, baseUrl: string) => {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value

  const normalizedBase = baseUrl.replace(/\/+$/, "")
  const normalizedPath = value.startsWith("/") ? value : `/${value}`
  return `${normalizedBase}${normalizedPath}`
}

const buildInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "LV"

const mapHost = (host: BackendEntity, baseUrl: string, fallbackUser: BackendEntity): LiveStudioHost => {
  const source = Object.keys(host).length > 0 ? host : fallbackUser
  const name = asString(source.name || source.username)

  return {
    id: asNumber(source.id || source.user_id),
    name,
    username: asString(source.username),
    avatarUrl: normalizeImageUrl(asString(source.avatar), baseUrl),
    initials: buildInitials(name),
    note: asString(source.note) || "Host - timeline",
  }
}

const mapActivityItem = (item: BackendEntity, baseUrl: string): LiveStudioComment => ({
  id: asNumber(item.id),
  author: asString(item.author),
  username: asString(item.username),
  avatarUrl: normalizeImageUrl(asString(item.avatar), baseUrl),
  message: asString(item.message),
  timeText: asString(item.time_text),
  kind: asString(item.kind) === "joined"
    ? "joined"
    : asString(item.kind) === "left" ? "left" : "comment",
  isHost: asBoolean(item.is_host),
})

export async function fetchLiveBootstrap(event: H3Event): Promise<LiveStudioBootstrap> {
  const currentUser = await getBackendCurrentUser(event)
  const baseUrl = getBackendWebBase(event)
  const response = await createBackendWebClient(event).postForm<BackendLiveBootstrapResponse>(
    "live",
    undefined,
    { s: "bootstrap" },
  )
  const normalized = assertLiveWebSuccess(response, "Unable to load live studio.")

  return {
    enabled: asBoolean(normalized.enabled),
    canUseLive: asBoolean(normalized.can_use_live),
    blockedReason: asString(normalized.blocked_reason),
    host: mapHost(asEntity(normalized.host), baseUrl, currentUser),
    streamName: asString(normalized.stream_name),
    roomName: asString(normalized.room_name),
    wsUrl: asString(normalized.ws_url),
    token: asString(normalized.token),
    destination: asString(normalized.destination) || "timeline",
    currentPrivacy: asString(normalized.current_privacy) || "0",
    destinationOptions: LIVE_DESTINATION_OPTIONS,
    privacyOptions: LIVE_PRIVACY_OPTIONS,
  }
}

export async function createLiveSession(
  event: H3Event,
  input: GoLiveDraft,
): Promise<LiveStudioSession> {
  const response = await createBackendWebClient(event).postForm<BackendLiveSessionResponse>(
    "live",
    {
      stream_name: input.streamName,
      title: input.title,
      description: input.description,
      post_privacy: input.privacy,
    },
    { s: "create" },
  )
  const normalized = assertLiveWebSuccess(response, "Unable to create live session.")
  const startedAtSeconds = asNumber(normalized.started_at)

  return {
    postId: asNumber(normalized.post_id),
    streamName: asString(normalized.stream_name) || input.streamName,
    roomName: asString(normalized.room_name),
    wsUrl: asString(normalized.ws_url),
    token: asString(normalized.token),
    title: asString(normalized.title) || input.title,
    description: asString(normalized.description) || input.description,
    postUrl: asString(normalized.post_url),
    startedAt: new Date((startedAtSeconds > 0 ? startedAtSeconds * 1000 : Date.now())).toISOString(),
    privacy: input.privacy,
  }
}

export async function fetchLiveHeartbeat(
  event: H3Event,
  input: {
    postId: number
    knownCommentIds?: number[]
  },
): Promise<LiveStudioHeartbeat> {
  const baseUrl = getBackendWebBase(event)
  const params = new URLSearchParams()

  params.append("post_id", String(input.postId))
  params.append("page", "live")

  ;(input.knownCommentIds ?? []).forEach((id, index) => {
    if (Number.isFinite(id) && id > 0) {
      params.append(`ids[${index}]`, String(id))
    }
  })

  const response = await createBackendWebClient(event).postForm<BackendLiveHeartbeatResponse, URLSearchParams>(
    "live",
    params,
    { s: "check_comments" },
  )
  const normalized = assertLiveWebSuccess(response, "Unable to refresh live activity.")

  return {
    stillLive: asString(normalized.still_live) === "stale"
      ? "stale"
      : asString(normalized.still_live) === "offline" ? "offline" : "live",
    viewerCount: asNumber(normalized.viewer_count || normalized.count),
    comments: (normalized.comments ?? []).map(item => mapActivityItem(item, baseUrl)),
    joinedUsers: (normalized.joined ?? []).map(item => mapActivityItem(item, baseUrl)),
    leftUsers: (normalized.left ?? []).map(item => mapActivityItem(item, baseUrl)),
    reactionsCount: asNumber(normalized.reactions_count),
    sharesCount: asNumber(normalized.shares_count),
    clipsCount: asNumber(normalized.clips_count),
    heartbeatAge: asNumber(normalized.heartbeat_age),
  }
}

export async function endLiveSession(
  event: H3Event,
  postId: number,
): Promise<LiveMutationResult> {
  const response = await createBackendWebClient(event).postForm<BackendLiveMutationResponse>(
    "live",
    { post_id: postId },
    { s: "delete" },
  )
  const normalized = assertLiveWebSuccess(response, "Unable to end live session.")

  return {
    success: true,
    message: asString(normalized.message) || "Live session ended.",
  }
}

export async function uploadLiveThumbnail(
  event: H3Event,
  postId: number,
  thumbnailFile: File,
): Promise<LiveMutationResult> {
  const formData = new FormData()

  formData.append("post_id", String(postId))
  formData.append("thumb", thumbnailFile, thumbnailFile.name)

  const response = await createBackendWebClient(event).postForm<BackendLiveMutationResponse, FormData>(
    "live",
    formData,
    { s: "create_thumb" },
  )
  const normalized = assertLiveWebSuccess(response, "Unable to upload live thumbnail.")

  return {
    success: true,
    message: asString(normalized.message) || "Live thumbnail updated.",
    thumbnailUrl: normalizeImageUrl(asString(normalized.thumb_url), getBackendWebBase(event)),
  }
}
