// English description: Loads saved posts through the feed repository and exposes page-level state for the saved route.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

export function useSavedPostsPageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const posts = ref<FeedPostRecord[]>([])

  async function fetchSavedPosts() {
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await repository.getSaved({ limit: 20 })
      posts.value = response.posts
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.savedPostsPage.emptyDescription")
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    posts,
    fetchSavedPosts,
  }
}
