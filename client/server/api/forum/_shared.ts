// English description: Maps backend PHP forum sections into the forum bounded-context catalog shape.

import { type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient } from "../../utils/backend-api-client"
import type { ForumCatalog, ForumSummaryForum, ForumSummarySection } from "../../../src/forum/domain/types/forum.types"

type BackendEntity = Record<string, unknown>

type BackendForumResponse = {
  api_status?: number | string
  can_create?: boolean
  sections?: BackendEntity[]
  has_more?: boolean
  next_offset?: number | string | null
  errors?: {
    error_text?: string
  }
}

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value).trim() : ""

const asNumber = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const mapForum = (item: BackendEntity, sectionId: number): ForumSummaryForum => ({
  id: asNumber(item.id),
  sectionId,
  title: asString(item.name_lang || item.name),
  description: asString(item.description_lang || item.description),
  posts: asNumber(item.posts),
  url: `/forums?fid=${asNumber(item.id)}`,
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

export async function fetchForumCatalog(
  event: H3Event,
  query: { q?: string; offset?: number | null; limit?: number },
): Promise<ForumCatalog> {
  const response = await createBackendApiClient(event).post<BackendForumResponse>("forum", {
    keyword: query.q || "",
    offset: query.offset || 0,
    limit: query.limit || 20,
  })
  const data = assertBackendApiSuccess(response, "Unable to load forum.")

  return {
    sections: (data.sections ?? []).map(mapSection),
    canCreate: Boolean(data.can_create),
    hasMore: Boolean(data.has_more),
    nextOffset: data.next_offset ? asNumber(data.next_offset) : null,
  }
}
