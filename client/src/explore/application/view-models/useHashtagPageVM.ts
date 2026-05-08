// English description: Loads hashtag posts from the feed repository and exposes normalized route-driven state for the hashtag route.

import { formatHashtagLabel, normalizeHashtagValue } from "../../../feed/application/composables/useHashtagData"
import type { FeedPostRecord } from "../../../feed/domain/types/feed.types"
import { createApiFeedRepository } from "../../../feed/infrastructure/repositories/ApiFeedRepository"

function readRouteParam(value: unknown) {
  if (Array.isArray(value)) {
    return String(value[0] || "")
  }

  return typeof value === "string" ? value : ""
}

export function useHashtagPageVM(
  repository = createApiFeedRepository(),
) {
  const route = useRoute()
  const { t } = useI18n()

  const loading = ref(true)
  const errorMessage = ref("")
  const matchingPosts = ref<FeedPostRecord[]>([])

  const rawTag = computed(() => normalizeHashtagValue(readRouteParam(route.params.tag)))
  const hashtagLabel = computed(() => formatHashtagLabel(rawTag.value))

  async function fetchHashtagPosts() {
    loading.value = true
    errorMessage.value = ""

    try {
      const response = await repository.getHashtag(rawTag.value, { limit: 18 })
      matchingPosts.value = response.posts
    }
    catch (error) {
      errorMessage.value = error instanceof Error
        ? error.message
        : t("pages.hashtagPage.emptyDescription", { tag: hashtagLabel.value })
      matchingPosts.value = []
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    matchingPosts,
    rawTag,
    hashtagLabel,
    fetchHashtagPosts,
  }
}
