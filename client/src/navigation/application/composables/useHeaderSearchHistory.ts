// English description: Persists recently selected header-search results per authenticated user.

import { useCurrentAuthUserStore } from "../../../auth/application/stores/useCurrentAuthUserStore"
import type { HeaderSearchSuggestion } from "../../domain/types/navigation-search.types"

const MAX_HISTORY_ITEMS = 8
const STORAGE_PREFIX = "navigation:header-search-history"

const isHistoryItem = (value: unknown): value is HeaderSearchSuggestion => {
  if (!value || typeof value !== "object") return false

  const item = value as Partial<HeaderSearchSuggestion>
  return typeof item.id === "string"
    && typeof item.kind === "string"
    && ["user", "page", "group", "hashtag"].includes(item.kind)
    && typeof item.title === "string"
    && typeof item.subtitle === "string"
    && typeof item.href === "string"
}

export function useHeaderSearchHistory() {
  const authStore = useCurrentAuthUserStore()
  const items = ref<HeaderSearchSuggestion[]>([])
  const ownerKey = computed(() => String(authStore.user?.id ?? "guest"))
  const storageKey = computed(() => `${STORAGE_PREFIX}:${ownerKey.value}`)

  function load() {
    if (!import.meta.client) return

    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey.value) || "[]")
      items.value = Array.isArray(parsed)
        ? parsed.filter(isHistoryItem).slice(0, MAX_HISTORY_ITEMS)
        : []
    }
    catch {
      items.value = []
    }
  }

  function persist() {
    if (!import.meta.client) return

    try {
      localStorage.setItem(storageKey.value, JSON.stringify(items.value))
    }
    catch {
      // Search history is best-effort when browser storage is unavailable.
    }
  }

  function add(item: HeaderSearchSuggestion) {
    items.value = [
      item,
      ...items.value.filter(historyItem =>
        historyItem.id !== item.id || historyItem.kind !== item.kind,
      ),
    ].slice(0, MAX_HISTORY_ITEMS)
    persist()
  }

  function remove(item: Pick<HeaderSearchSuggestion, "id" | "kind">) {
    items.value = items.value.filter(historyItem =>
      historyItem.id !== item.id || historyItem.kind !== item.kind,
    )
    persist()
  }

  function clear() {
    items.value = []

    if (!import.meta.client) return
    try {
      localStorage.removeItem(storageKey.value)
    }
    catch {
      // Keep the cleared in-memory state if browser storage is unavailable.
    }
  }

  onMounted(async () => {
    await authStore.hydrate()
    load()
  })

  watch(ownerKey, load)

  return {
    items,
    add,
    remove,
    clear,
  }
}
