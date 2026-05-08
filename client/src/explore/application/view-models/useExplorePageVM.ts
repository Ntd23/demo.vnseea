// English description: Loads explore discovery data and exposes media-first state for the explore route.

import type { FeedExploreResponse } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

export function useExplorePageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const response = ref<FeedExploreResponse>({
    posts: [],
    users: [],
    pages: [],
    hashtags: [],
    announcement: null,
  })

  const mediaPosts = computed(() =>
    response.value.posts.filter(post => post.mediaItems.length > 0),
  )

  async function fetchExplore() {
    loading.value = true
    errorMessage.value = ""

    try {
      response.value = await repository.getExplore({ limit: 18 })
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.explorePage.emptyDescription")
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    response,
    mediaPosts,
    fetchExplore,
  }
}
