// English description: Coordinates lazy and independent pagination for each activity tab.
import { createApiActivityRepository } from "../../infrastructure/repositories/ApiActivityRepository"
import type { ActivityRepository } from "../../domain/repositories/ActivityRepository"
import type { ActivityCenterTab, PostActivityItem } from "../../domain/types/activity.types"

type TabState = {
  items: PostActivityItem[]
  loaded: boolean
  loading: boolean
  refreshing: boolean
  loadingMore: boolean
  error: string
  nextCursor?: string
  hasMore: boolean
}

const tabs: ActivityCenterTab[] = ["saved", "reaction", "comment", "share"]
const createTabState = (): TabState => ({
  items: [], loaded: false, loading: false, refreshing: false,
  loadingMore: false, error: "", hasMore: false,
})

export function useActivityCenterPageVM(
  activeTab: Readonly<Ref<ActivityCenterTab>>,
  repository: ActivityRepository = createApiActivityRepository(),
) {
  const state = reactive<Record<ActivityCenterTab, TabState>>({
    saved: createTabState(), reaction: createTabState(),
    comment: createTabState(), share: createTabState(),
  })
  const generations: Record<ActivityCenterTab, number> = {
    saved: 0, reaction: 0, comment: 0, share: 0,
  }

  async function load(category: ActivityCenterTab, mode: "initial" | "refresh" | "more") {
    const current = state[category]
    if (current.loading || current.refreshing || current.loadingMore) return
    if (mode === "more" && (!current.hasMore || !current.nextCursor)) return

    const generation = ++generations[category]
    current.loading = mode === "initial"
    current.refreshing = mode === "refresh"
    current.loadingMore = mode === "more"
    current.error = ""

    try {
      const page = await repository.getPostActivity({
        category, limit: 20, cursor: mode === "more" ? current.nextCursor : undefined,
      })
      if (generation !== generations[category]) return
      if (mode === "more") {
        const seen = new Set(current.items.map(item => item.postId))
        current.items.push(...page.items.filter(item => !seen.has(item.postId)))
      }
      else current.items = page.items
      current.loaded = true
      current.nextCursor = page.nextCursor
      current.hasMore = page.hasMore
    }
    catch (error) {
      if (generation === generations[category]) {
        current.error = error instanceof Error ? error.message : "Could not load activity."
      }
    }
    finally {
      if (generation === generations[category]) {
        current.loading = false
        current.refreshing = false
        current.loadingMore = false
      }
    }
  }

  const ensureLoaded = (category: ActivityCenterTab) => {
    if (!state[category].loaded && !state[category].loading) return load(category, "initial")
    return Promise.resolve()
  }
  const refresh = (category: ActivityCenterTab) => load(category, "refresh")
  const loadMore = (category: ActivityCenterTab) => load(category, "more")

  watch(activeTab, category => void ensureLoaded(category), { immediate: true })
  onActivated(() => void refresh(activeTab.value))

  return { tabs, state, ensureLoaded, refresh, loadMore }
}
