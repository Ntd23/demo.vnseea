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
  const allLoaded = computed(() => !hasMore.value)

  async function fetchPosts(reset = true) {
    errorMessage.value = ""
    const previousOffset = nextOffset.value

    try {
      const response = await repository.getPhotos({
        limit: PHOTO_POSTS_PAGE_SIZE,
        afterPostId: reset ? undefined : nextOffset.value ?? undefined,
      })

      const newPosts = reset
        ? response.posts
        : response.posts.filter(post => !posts.value.some(existing => existing.id === post.id))
      const cursorDidNotAdvance = !reset
        && response.nextOffset !== null
        && response.nextOffset === previousOffset

      hasMore.value = response.hasMore && newPosts.length > 0 && !cursorDidNotAdvance
      nextOffset.value = response.nextOffset
      posts.value = reset
        ? newPosts
        : [...posts.value, ...newPosts]
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
    allLoaded,
    fetchPosts,
    loadMore,
    removePost,
  }
}
