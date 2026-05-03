// Description: Loads a community page from the backend-backed repository and derives display labels for the detail page.

import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { formatCommunityCount } from "../../domain/services/community-metrics.service"
import { createApiCommunityRepository } from "../../infrastructure/repositories/ApiCommunityRepository"

export function useCommunityPageDetail(
  slugSource: MaybeRefOrGetter<string>,
  repository = createApiCommunityRepository(),
) {
  const { t, locale } = useI18n()
  const slug = computed(() => String(toValue(slugSource) || "").trim())

  const { data: page, status, error, refresh } = useAsyncData(
    () => `community:page:${slug.value}`,
    () => slug.value ? repository.getPageBySlug(slug.value) : Promise.resolve(null),
    {
      watch: [slug],
      default: () => null,
    },
  )

  const categoryLabel = computed(() =>
    t(`pages.pageDetailPage.categories.${page.value?.category || "local-business"}`),
  )

  const followerCountLabel = computed(() =>
    t("pages.pageDetailPage.followerCount", {
      count: formatCommunityCount(page.value?.followers ?? 0, locale.value),
    }),
  )

  const likeCountLabel = computed(() =>
    t("pages.pageDetailPage.likeCount", {
      count: formatCommunityCount(page.value?.likes ?? 0, locale.value),
    }),
  )

  const pagePosts = computed(() => [])

  return {
    slug,
    page,
    categoryLabel,
    followerCountLabel,
    likeCountLabel,
    pagePosts,
    status,
    error,
    refresh,
  }
}
