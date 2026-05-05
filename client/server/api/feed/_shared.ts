// English description: Maps legacy PHP feed, explore, memory, and poke payloads into normalized Nuxt API responses for Dev 2 pages.

import { createError, getQuery, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { getBackendCurrentUser } from "../../utils/backend-current-user"
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url"
import { mapCommunityPageRecord } from "../community/_shared"
import type {
  FeedAnnouncement,
  FeedCommentRecord,
  FeedExploreResponse,
  FeedExploreUserRecord,
  FeedHashtagChip,
  FeedHomeResponse,
  FeedMemoriesResponse,
  FeedMediaItem,
  FeedPokeActionResult,
  FeedPokeRecord,
  FeedPostRecord,
  FeedPostsResponse,
  FeedStoryRecord,
} from "../../../src/feed/domain/types/feed.types"

type BackendEntity = Record<string, unknown>

type BackendPostsResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendUserStoriesResponse = {
  api_status?: number | string
  stories?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendGeneralDataResponse = {
  api_status?: number | string
  announcement?: BackendEntity
  trending_hashtag?: unknown
  errors?: {
    error_text?: string
  }
}

type BackendRecommendedResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendMemoriesResponse = {
  api_status?: number | string
  data?: {
    posts?: BackendEntity[]
    friends?: BackendEntity[]
  }
  errors?: {
    error_text?: string
  }
}

type BackendPokeResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  message_data?: string
  errors?: {
    error_text?: string
  }
}

const accentPalette = [
  "#2563eb",
  "#0369a1",
  "#7c3aed",
  "#0f766e",
  "#ea580c",
  "#e11d48",
] as const

const videoExtensions = ["mp4", "mov", "webm", "m4v", "avi", "mpeg", "mkv"]

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
    if (value) {
      return value
    }
  }

  return ""
}

const firstNumber = (entity: BackendEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asNumber(entity[key])
    if (value > 0) {
      return value
    }
  }

  return 0
}

const stripHtml = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

const createInitials = (value: string, fallback = "VN") => {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return initials || fallback
}

const normalizeHashtagValue = (value: string) =>
  value
    .replace(/^#/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const formatHashtagPath = (value: string) => {
  const slug = normalizeHashtagValue(value)
  return slug ? `/hashtag/${slug}` : "/explore"
}

const createAccent = (id: number) =>
  accentPalette[Math.abs(id) % accentPalette.length]

const createGradient = (id: number) =>
  `linear-gradient(135deg,#0f172a 0%,${createAccent(id)} 58%,#bfdbfe 100%)`

const inferAudience = (entity: BackendEntity) => {
  const privacy = asString(entity.postPrivacy || entity.privacy || entity.post_privacy)

  if (privacy === "3") return "Only me"
  if (privacy === "2") return "Group"
  if (privacy === "1") return "Friends"
  return "Public"
}

const inferCategory = (source: string) => {
  const normalized = source.toLowerCase()

  if (/design|branding|ui|ux|creative/.test(normalized)) return "design"
  if (/tech|ai|code|frontend|backend|developer/.test(normalized)) return "technology"
  if (/business|founder|startup|sale|seller|market/.test(normalized)) return "business"
  if (/product|launch|roadmap|feature|marketplace/.test(normalized)) return "product"
  if (/event|demo|meetup|conference|live/.test(normalized)) return "events"
  if (/education|learn|class|course|workshop|mentor/.test(normalized)) return "education"
  if (/portrait|photo|gallery|camera/.test(normalized)) return "portraits"

  return "community"
}

const isVideoUrl = (value: string) => {
  const normalized = value.toLowerCase()
  return videoExtensions.some(extension => normalized.includes(`.${extension}`))
    || normalized.includes("_video")
}

const extractTags = (entity: BackendEntity) => {
  const explicitTags = [
    ...asArray(entity.tags).map(tag => asString(tag.tag || tag.name || tag)),
    ...asString(entity.hash).split(","),
    ...asString(entity.hashtag).split(","),
  ]

  const inlineTags = Array.from(
    new Set(
      stripHtml(firstString(entity, ["postText", "Orginaltext", "text"]))
        .match(/#[\p{L}\p{N}_-]+/gu) ?? [],
    ),
  )

  return Array.from(new Set(
    [...explicitTags, ...inlineTags]
      .map(item => item.replace(/^#/, "").trim())
      .filter(Boolean),
  ))
}

const extractMediaItems = (
  entity: BackendEntity,
  fallbackAlt: string,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
) => {
  const items: FeedMediaItem[] = []
  const seen = new Set<string>()
  const appendItem = (candidate: FeedMediaItem | null) => {
    if (!candidate?.src || seen.has(candidate.src)) {
      return
    }

    seen.add(candidate.src)
    items.push(candidate)
  }

  const appendMediaValue = (value: string, type: "image" | "video", thumb?: string) => {
    if (!value) return

    appendItem({
      type,
      src: value,
      alt: fallbackAlt,
      thumb,
      mime: type === "video" ? "video/mp4" : undefined,
    })
  }

  const albumSources = [
    ...asArray(entity.photo_album),
    ...asArray(entity.album),
    ...asArray(entity.photo_multi),
    ...asArray(entity.images),
  ]

  for (const media of albumSources) {
    const src = resolveMediaUrl(firstString(media, ["image", "filename", "postFile", "src"]))
    appendMediaValue(src, isVideoUrl(src) ? "video" : "image")
  }

  const postFile = resolveMediaUrl(firstString(entity, ["postFile"]))
  const postThumb = resolveMediaUrl(firstString(entity, ["postFileThumb", "url_image"]))
  const externalVideoThumb = resolveMediaUrl(firstString(entity, ["url_image", "postFileThumb"]))

  if (postFile) {
    appendMediaValue(postFile, isVideoUrl(postFile) ? "video" : "image", postThumb || undefined)
  }

  if (!items.length) {
    const fallbackImage = resolveMediaUrl(firstString(entity, ["postFileThumb", "url_image"]))
    if (fallbackImage) {
      appendMediaValue(fallbackImage, "image")
    }
  }

  if (!items.length) {
    const externalVideo = firstString(entity, [
      "postYoutube",
      "postVimeo",
      "postPlaytube",
      "postVine",
      "postDailymotion",
      "postFacebook",
    ])

    if (externalVideoThumb) {
      appendMediaValue(externalVideoThumb, "image")
    }
    else if (externalVideo && isVideoUrl(externalVideo)) {
      appendMediaValue(externalVideo, "video")
    }
  }

  return items
}

const mapCommentRecord = (entity: BackendEntity): FeedCommentRecord => {
  const publisher = asRecord(entity.publisher)
  const author = firstString(publisher, ["name", "username"]) || "User"

  return {
    id: firstNumber(entity, ["id", "comment_id"]),
    author,
    role: firstString(publisher, ["working", "school", "address"]) || author,
    text: stripHtml(firstString(entity, ["text", "Orginaltext", "comment"])),
  }
}

export const mapPostRecord = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
): FeedPostRecord => {
  const publisher = asRecord(entity.publisher)
  const userData = asRecord(entity.user_data)
  const pageData = asRecord(entity.page_data)
  const groupData = asRecord(entity.group_data)
  const sourceEntity = Object.keys(publisher).length > 0 ? publisher : userData
  const author = firstString(sourceEntity, ["name", "username"])
    || firstString(pageData, ["page_title", "page_name"])
    || firstString(groupData, ["group_title", "group_name"])
    || "User"
  const authorUsername = firstString(sourceEntity, ["username"])
  const pageSlug = firstString(pageData, ["page_name"])
  const groupSlug = firstString(groupData, ["group_name"])
  const sourcePath = pageSlug
    ? `/p/${pageSlug}`
    : groupSlug
      ? `/g/${groupSlug}`
      : authorUsername
        ? `/@${authorUsername}`
        : "/home"
  const text = stripHtml(firstString(entity, ["postText", "Orginaltext", "text"]))
  const mediaItems = extractMediaItems(entity, author, resolveMediaUrl)
  const categoryHint = [
    firstString(sourceEntity, ["working", "school"]),
    text,
    extractTags(entity).join(" "),
  ].join(" ")
  const primaryMediaType = !mediaItems.length
    ? "text"
    : mediaItems.some(item => item.type === "video")
      ? "video"
      : "image"

  return {
    id: firstNumber(entity, ["post_id", "id"]),
    author,
    authorAvatarUrl: resolveMediaUrl(firstString(sourceEntity, ["avatar", "avatar_full"])),
    authorPath: authorUsername ? `/@${authorUsername}` : sourcePath,
    role: firstString(sourceEntity, ["working", "school", "address"])
      || firstString(pageData, ["category_name", "phone"])
      || firstString(groupData, ["category_name", "group_title"])
      || author,
    audience: inferAudience(entity),
    time: firstString(entity, ["time_text", "posted", "time"]) || "",
    text,
    tags: extractTags(entity),
    stats: {
      likes: firstNumber(entity, ["post_likes", "likes", "likes_count", "likes_count_total"]),
      comments: firstNumber(entity, ["post_comments", "comments", "comments_count", "comments_count_total"]),
      shares: firstNumber(entity, ["post_shares", "shares", "shares_count"]),
      views: firstNumber(entity, ["post_views", "view_count", "views"]),
    },
    comments: asArray(entity.get_post_comments).map(mapCommentRecord),
    mediaItems,
    category: inferCategory(categoryHint),
    primaryMediaType,
    sourceLabel: pageSlug ? "page" : groupSlug ? "group" : "feed",
    sourcePath,
    isSaved: isTruthy(entity.is_post_saved) || isTruthy(entity.is_saved),
  }
}

const mapStoryRecord = (
  entity: BackendEntity,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
): FeedStoryRecord => {
  const user = asRecord(entity.user_data)
  const id = firstNumber(entity, ["id", "story_id"])
  const ownerId = firstNumber(entity, ["user_id", "owner_id"])
    || firstNumber(user, ["user_id", "id"])
  const ownerUsername = firstString(user, ["username"])
  const author = firstString(user, ["name", "username"]) || ownerUsername || "User"
  const ownerKey = ownerId > 0
    ? `user:${ownerId}`
    : ownerUsername
      ? `username:${ownerUsername}`
      : `author:${author.toLowerCase()}`

  return {
    id,
    ownerId,
    ownerKey,
    ownerUsername,
    author,
    avatar: createInitials(author),
    avatarUrl: resolveMediaUrl(firstString(user, ["avatar", "avatar_full"])),
    gradient: createGradient(id),
    media: resolveMediaUrl(firstString(entity, ["thumbnail"]))
      || resolveMediaUrl(firstString(asRecord(entity.thumb), ["filename"]))
      || resolveMediaUrl(firstString(user, ["avatar", "avatar_full"])),
    title: firstString(entity, ["title"]),
    caption: firstString(entity, ["description"]) || "",
    meta: firstString(entity, ["time_text"]) || "",
    likes: firstNumber(entity, ["reaction_count", "likes"]),
    comments: firstNumber(entity, ["comment_count", "comments"]),
    views: firstNumber(entity, ["view_count", "views"]),
    isMe: ownerId === currentUserId,
  }
}

const sortStoriesByLatest = (stories: FeedStoryRecord[]) =>
  [...stories].sort((left, right) => right.id - left.id)

const withStoryOwnerData = (story: BackendEntity, ownerEntry: BackendEntity) => {
  if (Object.keys(asRecord(story.user_data)).length > 0) {
    return story
  }

  const ownerData = { ...ownerEntry }
  delete ownerData.stories

  return {
    ...story,
    user_id: firstNumber(story, ["user_id", "owner_id"]) || firstNumber(ownerEntry, ["user_id", "id"]),
    user_data: ownerData,
  }
}

const extractUserStorySequences = (
  payload: BackendUserStoriesResponse | null,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
) => {
  return (payload?.stories ?? [])
    .map((ownerEntry) => {
      const nestedStories = asArray(ownerEntry.stories)

      if (!nestedStories.length) {
        return []
      }

      return sortStoriesByLatest(
        nestedStories.map(story =>
          mapStoryRecord(withStoryOwnerData(story, ownerEntry), currentUserId, resolveMediaUrl),
        ),
      )
    })
    .filter(stories => stories.length > 0)
}

const flattenStorySequences = (
  sequences: FeedStoryRecord[][],
  currentUserId: number,
) =>
  [...sequences]
    .sort((left, right) => {
      const leftLatest = left[0]
      const rightLatest = right[0]
      const leftIsCurrentUser = leftLatest?.ownerId === currentUserId
      const rightIsCurrentUser = rightLatest?.ownerId === currentUserId

      if (leftIsCurrentUser && !rightIsCurrentUser) return -1
      if (rightIsCurrentUser && !leftIsCurrentUser) return 1

      return (rightLatest?.id ?? 0) - (leftLatest?.id ?? 0)
    })
    .flat()

const requestUserStorySequences = async (
  client: ReturnType<typeof createBackendApiClient>,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
  input: {
    limit?: number
    offset?: number
  } = {},
) => {
  const response = assertBackendApiSuccess(
    await client.post<BackendUserStoriesResponse, Record<string, unknown>>(
      "get-user-stories",
      {
        limit: input.limit ?? 50,
        offset: input.offset,
      },
    ),
    "Unable to load stories.",
  )

  return extractUserStorySequences(response, currentUserId, resolveMediaUrl)
}

const requestOwnStories = async (
  client: ReturnType<typeof createBackendApiClient>,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
) => {
  if (currentUserId <= 0) {
    return []
  }

  const sequences = await requestUserStorySequences(client, currentUserId, resolveMediaUrl, {
    limit: 50,
    offset: currentUserId + 1,
  })

  return sequences.find(stories => stories[0]?.ownerId === currentUserId) ?? []
}

const requestLatestOwnStory = async (
  client: ReturnType<typeof createBackendApiClient>,
  currentUserId: number,
  resolveMediaUrl: (value: unknown) => string,
) => {
  const stories = await requestOwnStories(client, currentUserId, resolveMediaUrl)
  return stories[0] ?? null
}

export async function fetchLatestOwnStory(event: H3Event, currentUserId?: number) {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const resolvedCurrentUserId = currentUserId
    ?? asNumber((await getBackendCurrentUser(event)).user_id)

  return await requestLatestOwnStory(client, resolvedCurrentUserId, resolveMediaUrl)
}

const mapAnnouncement = (entity: BackendEntity | undefined): FeedAnnouncement | null => {
  if (!entity) {
    return null
  }

  const title = firstString(entity, ["title", "name"]) || "Announcement"
  const message = stripHtml(firstString(entity, ["text", "description", "message"]))

  if (!title && !message) {
    return null
  }

  return {
    title,
    message,
  }
}

const extractTrendingHashtags = (value: unknown) => {
  const chips: FeedHashtagChip[] = []
  const accumulator = new Map<string, FeedHashtagChip>()
  const rawItems = Array.isArray(value)
    ? value
    : asArray(asRecord(value).data)

  rawItems.forEach((item, index) => {
    const label = firstString(item, ["tag", "hashtag", "name", "title"])
    const slug = normalizeHashtagValue(label)

    if (!slug) {
      return
    }

    const existing = accumulator.get(slug)
    if (existing) {
      existing.count += 1
      return
    }

    accumulator.set(slug, {
      label: label.replace(/^#/, ""),
      slug,
      count: firstNumber(item, ["trend", "count", "total"]) || Math.max(1, rawItems.length - index),
      to: formatHashtagPath(label),
    })
  })

  accumulator.forEach(item => chips.push(item))

  return chips.sort((left, right) => right.count - left.count)
}

const mapExploreUser = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
): FeedExploreUserRecord => {
  const id = firstNumber(entity, ["user_id", "id"])
  const name = firstString(entity, ["name", "username"]) || `User ${id}`
  const username = firstString(entity, ["username"]) || `user-${id}`
  const role = firstString(entity, ["working", "school", "address"]) || `@${username}`
  const tags = extractTags(entity)

  return {
    id,
    name,
    username,
    initials: createInitials(name, "US"),
    href: `/@${username}`,
    role,
    meta: firstString(entity, ["about", "lastseen_time_text", "gender_text"]) || role,
    reason: stripHtml(firstString(entity, ["about"])) || role,
    tags: tags.slice(0, 4),
    mutualLabel: firstString(entity, ["lastseen_time_text", "gender_text"]) || `@${username}`,
    accent: createAccent(id),
    online: isTruthy(entity.is_online) || asNumber(entity.lastseen) > (Math.floor(Date.now() / 1000) - 120),
    avatarUrl: resolveMediaUrl(firstString(entity, ["avatar", "avatar_full"])),
  }
}

const mapMemoryFriend = (entity: BackendEntity) => {
  const id = firstNumber(entity, ["user_id", "id"])
  const name = firstString(entity, ["name", "username"]) || `User ${id}`

  return {
    id: `friend-${id}`,
    name,
    initials: createInitials(name, "FR"),
    label: firstString(entity, ["time_text", "working", "school"]) || name,
    note: firstString(entity, ["about", "address"]) || firstString(entity, ["working", "school"]) || "",
  }
}

const mapMemoryPost = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
) => {
  const post = mapPostRecord(entity, resolveMediaUrl)
  const timeLabel = post.time || "Memory"
  const text = post.text || post.author

  return {
    id: `memory-${post.id}`,
    post,
    happenedOnLabel: timeLabel,
    memoryLabel: timeLabel,
    yearOffset: Math.max(1, Math.min(10, Math.floor((post.id % 7) + 1))),
    reflection: text,
  }
}

const mapPokeRecord = (
  entity: BackendEntity,
  resolveMediaUrl: (value: unknown) => string = value => asString(value),
): FeedPokeRecord => {
  const user = asRecord(entity.user_data)
  const userId = firstNumber(user, ["user_id", "id"])
  const name = firstString(user, ["name", "username"]) || `User ${userId}`

  return {
    id: `poke-${firstNumber(entity, ["id"])}-${userId}`,
    pokeId: firstNumber(entity, ["id"]),
    userId,
    name,
    initials: createInitials(name, "PK"),
    href: firstString(user, ["username"]) ? `/@${firstString(user, ["username"])}` : "/poke",
    role: firstString(user, ["working", "school", "address"]) || `@${firstString(user, ["username"])}`,
    timeLabel: firstString(entity, ["time_text", "created_at"]) || "",
    mutualLabel: firstString(user, ["username"]) ? `@${firstString(user, ["username"])}` : name,
    contextLabel: firstString(user, ["working", "school"]) || name,
    note: stripHtml(firstString(user, ["about"])) || firstString(user, ["address"]) || "",
    accent: createAccent(userId),
    online: asNumber(user.lastseen) > (Math.floor(Date.now() / 1000) - 120),
    avatarUrl: resolveMediaUrl(firstString(user, ["avatar", "avatar_full"])),
    isFollowing: isTruthy(user.is_following),
  }
}

const resolveLimit = (event: H3Event, fallback: number, max = 30) => {
  const query = getQuery(event)
  const rawValue = Array.isArray(query.limit) ? query.limit[0] : query.limit
  const parsed = Number(rawValue ?? fallback)
  return Number.isFinite(parsed) && parsed > 0
    ? Math.min(Math.floor(parsed), max)
    : fallback
}

const resolveOffset = (event: H3Event) => {
  const query = getQuery(event)
  const rawValue = Array.isArray(query.afterPostId) ? query.afterPostId[0] : query.afterPostId
  const parsed = Number(rawValue ?? 0)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0
}

const buildPostsResponse = (posts: FeedPostRecord[], limit: number): FeedPostsResponse => ({
  posts,
  hasMore: posts.length >= limit,
  nextOffset: posts.at(-1)?.id ?? null,
})

export async function fetchFeedPosts(
  event: H3Event,
  input: {
    type: "get_news_feed" | "saved" | "hashtag" | "get_random_videos"
    limit?: number
    afterPostId?: number
    postType?: string
    followingOnly?: boolean
    tag?: string
  },
) {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const limit = input.limit ?? 10
  const response = assertBackendApiSuccess(
    await client.post<BackendPostsResponse, Record<string, unknown>>(
      input.type === "get_random_videos" ? "posts" : "posts",
      {
        type: input.type,
        limit,
        after_post_id: input.afterPostId ?? 0,
        filter: input.followingOnly ? 1 : 0,
        post_type: input.postType,
        hash: input.tag,
      },
    ),
    "Unable to load feed posts.",
  )

  return buildPostsResponse((response.data ?? []).map(post => mapPostRecord(post, resolveMediaUrl)), limit)
}

export async function fetchFeedHome(event: H3Event): Promise<FeedHomeResponse> {
  const currentUser = await getBackendCurrentUser(event)
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const currentUserId = asNumber(currentUser.user_id)
  const limit = resolveLimit(event, 8, 20)
  const afterPostId = resolveOffset(event)
  const query = getQuery(event)
  const postType = Array.isArray(query.postType) ? query.postType[0] : query.postType
  const followingOnly = String(Array.isArray(query.followingOnly) ? query.followingOnly[0] : query.followingOnly || "0") === "1"

  const [postsResponse, storySequences, generalResponse] = await Promise.all([
    client.post<BackendPostsResponse, Record<string, unknown>>(
      "posts",
      {
        type: "get_news_feed",
        limit,
        after_post_id: afterPostId,
        filter: followingOnly ? 1 : 0,
        post_type: asString(postType),
      },
    ),
    requestUserStorySequences(client, currentUserId, resolveMediaUrl),
    client.post<BackendGeneralDataResponse, Record<string, unknown>>(
      "get-general-data",
      {
        fetch: "announcement",
      },
    ),
  ])

  const posts = assertBackendApiSuccess(postsResponse, "Unable to load home feed.")
  const general = assertBackendApiSuccess(generalResponse, "Unable to load announcement.")

  return {
    ...buildPostsResponse((posts.data ?? []).map(post => mapPostRecord(post, resolveMediaUrl)), limit),
    stories: flattenStorySequences(storySequences, currentUserId),
    announcement: mapAnnouncement(general.announcement),
  }
}

export async function fetchExplore(event: H3Event): Promise<FeedExploreResponse> {
  const currentUser = await getBackendCurrentUser(event)
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const limit = resolveLimit(event, 6, 12)

  const [
    usersResponse,
    pagesResponse,
    postsResponse,
    generalResponse,
  ] = await Promise.all([
    client.post<BackendRecommendedResponse, Record<string, unknown>>(
      "fetch-recommended",
      {
        type: "users",
        limit,
      },
    ),
    client.post<BackendRecommendedResponse, Record<string, unknown>>(
      "fetch-recommended",
      {
        type: "pages",
        limit,
      },
    ),
    client.post<BackendPostsResponse, Record<string, unknown>>(
      "posts",
      {
        type: "get_news_feed",
        limit,
      },
    ),
    client.post<BackendGeneralDataResponse, Record<string, unknown>>(
      "get-general-data",
      {
        fetch: "trending_hashtag,announcement",
      },
    ),
  ])

  const users = assertBackendApiSuccess(usersResponse, "Unable to load recommended users.")
  const pages = assertBackendApiSuccess(pagesResponse, "Unable to load recommended pages.")
  const posts = assertBackendApiSuccess(postsResponse, "Unable to load explore posts.")
  const general = assertBackendApiSuccess(generalResponse, "Unable to load explore metadata.")

  return {
    posts: (posts.data ?? []).map(post => mapPostRecord(post, resolveMediaUrl)),
    users: (users.data ?? []).map(user => mapExploreUser(user, resolveMediaUrl)),
    pages: (pages.data ?? []).map(page =>
      mapCommunityPageRecord(page, { currentUserId: asNumber(currentUser.user_id) }),
    ),
    hashtags: extractTrendingHashtags(general.trending_hashtag),
    announcement: mapAnnouncement(general.announcement),
  }
}

export async function fetchMemories(event: H3Event): Promise<FeedMemoriesResponse> {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendMemoriesResponse, Record<string, unknown>>(
      "get_memories",
      {
        type: "all",
      },
    ),
    "Unable to load memories.",
  )

  return {
    posts: asArray(response.data?.posts).map(post => mapMemoryPost(post, resolveMediaUrl)),
    friends: asArray(response.data?.friends).map(mapMemoryFriend),
  }
}

export async function fetchPokes(event: H3Event) {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendPokeResponse, Record<string, unknown>>(
      "poke",
      {
        type: "fetch",
      },
    ),
    "Unable to load poke requests.",
  )

  return (response.data ?? []).map(record => mapPokeRecord(record, resolveMediaUrl))
}

export async function runPokeAction(
  event: H3Event,
  input: {
    action: "create" | "remove"
    userId?: number
    pokeId?: number
  },
): Promise<FeedPokeActionResult> {
  const client = createBackendApiClient(event)
  const resolveMediaUrl = createBackendMediaUrlResolver(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendPokeResponse, Record<string, unknown>>(
      "poke",
      input.action === "create"
        ? {
            type: "create",
            user_id: input.userId,
          }
        : {
            type: "remove",
            poke_id: input.pokeId,
          },
    ),
    "Unable to update poke request.",
  )

  return {
    ok: true,
    record: response.data?.[0] ? mapPokeRecord(response.data[0], resolveMediaUrl) : undefined,
  }
}

export async function runPostAction(
  event: H3Event,
  input: {
    action: "like" | "comment" | "save" | "report"
    postId: number
    text?: string
  },
) {
  if (!input.postId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post id is required.",
    })
  }

  const client = createBackendApiClient(event)

  assertBackendApiSuccess(
    await client.post<Record<string, unknown>, Record<string, unknown>>(
      "post-actions",
      {
        action: input.action,
        post_id: input.postId,
        text: input.text,
      },
    ),
    "Unable to update post.",
  )

  return {
    ok: true,
  }
}
