// English description: Loads watch-page video posts and exposes pagination state for the watch route.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

export function useWatchPageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()

  const loading = ref(true)
  const loadingMore = ref(false)
  const errorMessage = ref("")
  const posts = ref<FeedPostRecord[]>([])
  const hasMore = ref(false)
  const nextOffset = ref<number | null>(null)

  async function fetchVideos(reset = true) {
    errorMessage.value = ""

    try {
      const response = await repository.getVideos({
        limit: 10,
        afterPostId: reset ? undefined : nextOffset.value ?? undefined,
      })

      hasMore.value = response.hasMore
      nextOffset.value = response.nextOffset
      posts.value = reset
        ? response.posts
        : [...posts.value, ...response.posts.filter(post => !posts.value.some(existing => existing.id === post.id))]
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.watchPage.emptyDescription")
    }
    finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) {
      return
    }

    loadingMore.value = true
    await fetchVideos(false)
  }

  return {
    loading,
    loadingMore,
    errorMessage,
    posts,
    hasMore,
    nextOffset,
    fetchVideos,
    loadMore,
  }
}
