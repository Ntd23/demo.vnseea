import { getQuery } from "h3"
import { createBackendApiClient } from "../../utils/backend-api-client"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { backendRoutes } from "../../../src/shared-kernel/application/constants/route-registry"

type BackendSearchEntity = Record<string, unknown>

type BackendSearchResponse = {
  api_status?: number | string
  users?: BackendSearchEntity[]
  pages?: BackendSearchEntity[]
  groups?: BackendSearchEntity[]
  channels?: BackendSearchEntity[]
  errors?: {
    error_text?: string
  }
}

export type SearchApiResultKind = "users" | "pages" | "groups" | "posts"

export type SearchApiResult = {
  id: string
  kind: SearchApiResultKind
  title: string
  subtitle: string
  description: string
  href: string
  initials: string
  badge?: string
  metricLabel: string
  metaLabel?: string
  tags: string[]
  searchableText: string
  accent: string
  popularityScore: number
  recentScore: number
}

export type SearchApiResponse = Record<SearchApiResultKind, SearchApiResult[]>

const emptyResponse = (): SearchApiResponse => ({
  users: [],
  pages: [],
  groups: [],
  posts: [],
})

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : ""

const firstString = (entity: BackendSearchEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asString(entity[key])
    if (value) return value
  }
  return ""
}

const toInitials = (value: string, fallback = "U") => {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")

  return initials || fallback
}

const createSearchableText = (parts: string[]) =>
  parts.filter(Boolean).join(" ").toLowerCase()

const createProfileHref = (username: string, id: string) =>
  username ? `/@${encodeURIComponent(username)}` : `/@user-${encodeURIComponent(id)}`

const createPageHref = (slug: string, id: string) =>
  slug ? `/p/${encodeURIComponent(slug)}` : `/p/page-${encodeURIComponent(id)}`

const createGroupHref = (slug: string, id: string) =>
  slug ? `/g/${encodeURIComponent(slug)}` : `/g/group-${encodeURIComponent(id)}`

function mapUsers(users: BackendSearchEntity[] = []): SearchApiResult[] {
  return users.map((user, index) => {
    const id = firstString(user, ["user_id", "id"]) || `user-${index + 1}`
    const name = firstString(user, ["name", "username"]) || "User"
    const username = firstString(user, ["username"])
    const about = firstString(user, ["about", "bio", "working", "address"])
    const followers = firstString(user, ["followers", "followers_count", "details.followers_count"])

    return {
      id: `user-${id}`,
      kind: "users",
      title: name,
      subtitle: username ? `@${username}` : "Member",
      description: about || "Member profile",
      href: createProfileHref(username, id),
      initials: toInitials(name),
      badge: Number(user.verified ?? 0) === 1 ? "Verified" : undefined,
      metricLabel: followers ? `${followers} followers` : "Profile",
      metaLabel: firstString(user, ["lastseen_time_text", "gender_text"]),
      tags: ["user", username].filter(Boolean),
      searchableText: createSearchableText([name, username, about]),
      accent: "#0000ff",
      popularityScore: Number(followers || 0),
      recentScore: 100 - index,
    }
  })
}

function mapPages(pages: BackendSearchEntity[] = []): SearchApiResult[] {
  return pages.map((page, index) => {
    const id = firstString(page, ["page_id", "id"]) || `page-${index + 1}`
    const slug = firstString(page, ["page_name", "username", "name"])
    const title = firstString(page, ["page_title", "title", "name", "page_name"]) || "Page"
    const about = firstString(page, ["about", "description"])

    return {
      id: `page-${id}`,
      kind: "pages",
      title,
      subtitle: slug ? `/p/${slug}` : "Page",
      description: about || "Community page",
      href: createPageHref(slug, id),
      initials: toInitials(title, "P"),
      badge: firstString(page, ["is_liked"]) === "yes" ? "Liked" : undefined,
      metricLabel: firstString(page, ["likes", "likes_count"]) || "Page",
      metaLabel: firstString(page, ["category", "category_name"]),
      tags: ["page", slug].filter(Boolean),
      searchableText: createSearchableText([title, slug, about]),
      accent: "#1d4ed8",
      popularityScore: Number(firstString(page, ["likes", "likes_count"]) || 0),
      recentScore: 90 - index,
    }
  })
}

function mapGroups(groups: BackendSearchEntity[] = []): SearchApiResult[] {
  return groups.map((group, index) => {
    const id = firstString(group, ["group_id", "id"]) || `group-${index + 1}`
    const slug = firstString(group, ["group_name", "name"])
    const title = firstString(group, ["group_title", "title", "name", "group_name"]) || "Group"
    const about = firstString(group, ["about", "description"])

    return {
      id: `group-${id}`,
      kind: "groups",
      title,
      subtitle: slug ? `/g/${slug}` : "Group",
      description: about || "Community group",
      href: createGroupHref(slug, id),
      initials: toInitials(title, "G"),
      badge: firstString(group, ["is_joined"]) === "yes" ? "Joined" : undefined,
      metricLabel: firstString(group, ["members", "members_count"]) || "Group",
      metaLabel: firstString(group, ["category", "category_name", "privacy"]),
      tags: ["group", slug].filter(Boolean),
      searchableText: createSearchableText([title, slug, about]),
      accent: "#0369a1",
      popularityScore: Number(firstString(group, ["members", "members_count"]) || 0),
      recentScore: 80 - index,
    }
  })
}

export default defineEventHandler(async (event): Promise<SearchApiResponse> => {
  const query = getQuery(event)
  const keyword = asString(query.q || query.keyword)
  const filterByAge = asString(query.filterbyage) === "yes" ? "yes" : "no"

  const payload: Record<string, unknown> = {
    search_key: keyword,
    limit: Number(query.limit || 35),
  }

  const country = asString(query.country)
  const gender = asString(query.gender)
  const verified = asString(query.verified)
  const status = asString(query.status)
  const image = asString(query.image)
  const ageFrom = asString(query.age_from)
  const ageTo = asString(query.age_to)

  if (country) payload.country = country
  if (gender) payload.gender = gender
  if (verified) payload.verified = verified
  if (status) payload.status = status
  if (image) payload.image = image
  payload.filterbyage = filterByAge

  if (filterByAge === "yes") {
    if (ageFrom) payload.age_from = ageFrom
    if (ageTo) payload.age_to = ageTo
  }

  const client = createBackendApiClient(event)
  const response = assertBackendApiSuccess(
    await client.post<BackendSearchResponse, Record<string, unknown>>(
      backendRoutes.api.search,
      payload,
    ),
    "Unable to search.",
  )

  return {
    users: mapUsers(response.users),
    pages: mapPages(response.pages),
    groups: mapGroups(response.groups),
    posts: [],
  }
})
