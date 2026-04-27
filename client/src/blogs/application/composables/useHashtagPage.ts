import { computed } from "vue"
import { readRouteStringParam } from "../../domain/services/hashtag.service"
import { useHashtagDataSource } from "../../infrastructure/adapters/hashtagData.adapter"

export function useHashtagPage() {
  const route = useRoute()
  const { t } = useI18n()

  const rawTag = computed(() => readRouteStringParam(route.params.tag))

  const {
    hashtagLabel,
    hasMatches,
    matchingPosts,
    relatedHashtags,
    suggestedHashtags,
    heroStats,
  } = useHashtagDataSource(rawTag)

  const visibleHashtags = computed(() =>
    (hasMatches.value ? relatedHashtags.value : suggestedHashtags.value).slice(0, 8),
  )

  const heroDescription = computed(() => {
    if (hasMatches.value) {
      return t("pages.hashtagPage.heroDescriptionMatch", { tag: hashtagLabel.value })
    }

    return t("pages.hashtagPage.heroDescriptionEmpty", { tag: hashtagLabel.value })
  })

  useSeoMeta({
    title: () => t("pages.hashtagPage.seoTitle", { tag: hashtagLabel.value }),
    description: () =>
      hasMatches.value
        ? t("pages.hashtagPage.seoDescriptionMatch", { tag: hashtagLabel.value })
        : t("pages.hashtagPage.seoDescriptionEmpty", { tag: hashtagLabel.value }),
  })

  return {
    t,
    rawTag,
    hashtagLabel,
    hasMatches,
    matchingPosts,
    relatedHashtags,
    suggestedHashtags,
    heroStats,
    visibleHashtags,
    heroDescription,
  }
}
