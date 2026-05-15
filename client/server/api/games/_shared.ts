// English description: Maps backend PHP games API records into the games bounded-context catalog shape.

import { createError, type H3Event } from "h3"
import { assertBackendApiSuccess } from "../../utils/backend-api-response"
import { createBackendApiClient, normalizeBackendBaseURL } from "../../utils/backend-api-client"
import type { GameRecord, GamesCatalog, GamesTabKey } from "../../../src/games/domain/types/games.types"

type BackendEntity = Record<string, unknown>

type BackendGamesResponse = {
  api_status?: number | string
  data?: BackendEntity[]
  errors?: {
    error_text?: string
  }
}

type BackendMutationResponse = {
  api_status?: number | string
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

const normalizeUrl = (value: unknown, baseUrl: string) => {
  const raw = asString(value)
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw
  return `${baseUrl.replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`
}

const mapGame = (item: BackendEntity, baseUrl: string, activeTab: GamesTabKey): GameRecord => {
  const id = asNumber(item.id || item.game_id)

  return {
    id,
    title: asString(item.game_name || item.name || item.title),
    avatarUrl: normalizeUrl(item.game_avatar || item.avatar || item.image, baseUrl),
    url: asString(item.url) || `/game/${id}`,
    lastPlay: asString(item.last_play),
    players: asNumber(item.players),
    isMine: activeTab === "my",
  }
}

const typeByTab = (tab: GamesTabKey, q: string) => {
  if (q) return "search"
  if (tab === "my") return "get_my"
  if (tab === "popular") return "popular"
  return "get"
}

export async function fetchGamesCatalog(
  event: H3Event,
  query: { tab?: GamesTabKey; q?: string; offset?: number | null; limit?: number },
): Promise<GamesCatalog> {
  const activeTab = query.tab === "my" || query.tab === "latest" || query.tab === "popular"
    ? query.tab
    : "my"
  const q = String(query.q ?? "").trim()
  const limit = query.limit && query.limit > 0 ? query.limit : 20
  const runtimeConfig = useRuntimeConfig(event)
  const baseUrl = normalizeBackendBaseURL(String(runtimeConfig.public.backendWebBase || runtimeConfig.backendApiBase))
  const response = await createBackendApiClient(event).post<BackendGamesResponse>("games", {
    type: typeByTab(activeTab, q),
    query: q,
    limit,
    offset: query.offset || 0,
  })

  const data = assertBackendApiSuccess(response, "Unable to load games.")
  const items = (data.data ?? []).map(item => mapGame(item, baseUrl, activeTab))

  return {
    items,
    activeTab,
    hasMore: items.length >= limit,
    nextOffset: items.length ? items[items.length - 1]!.id : null,
  }
}

export async function addGameToMyList(event: H3Event, gameId: number) {
  if (!gameId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Game id is required.",
    })
  }

  const response = await createBackendApiClient(event).post<BackendMutationResponse>("games", {
    type: "add_to_my",
    game_id: gameId,
  })

  assertBackendApiSuccess(response, "Unable to start game.")

  return { ok: true }
}
