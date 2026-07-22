// English description: Loads feed posts with image media for the header photo-feed view.

import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

const PHOTO_POSTS_PAGE_SIZE = 20

export function usePhotoPostsPageVM(
  repository = createApiFeedRepository(),
) {
  const { t } = useI18n()
  const loading = ref(true)
  const loadingMore = ref(false)
  const errorMessage = ref("")
  const posts = ref<FeedPostRecord[]>([])
  const hasMore = ref(false)
  const nextOffset = ref<number | null>(null)

  async function fetchPosts(reset = true) {
    errorMessage.value = ""

    try {
      const response = await repository.getPhotos({
        limit: PHOTO_POSTS_PAGE_SIZE,
        afterPostId: reset ? undefined : nextOffset.value ?? undefined,
      })

      hasMore.value = response.hasMore
      nextOffset.value = response.nextOffset
      posts.value = reset
        ? response.posts
        : [...posts.value, ...response.posts.filter(post => !posts.value.some(existing => existing.id === post.id))]
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : t("pages.photosPage.emptyDescription")
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
    await fetchPosts(false)
  }

  function removePost(postId: number) {
    posts.value = posts.value.filter(post => post.id !== postId)
  }

  return {
    loading,
    loadingMore,
    errorMessage,
    posts,
    hasMore,
    fetchPosts,
    loadMore,
    removePost,
  }
}
