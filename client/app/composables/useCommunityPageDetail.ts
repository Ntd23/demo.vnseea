import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { useMockSocialData } from "./useMockSocialData"
import {
  createCommunitySlug,
  getCommunityPageBySlug,
} from "../../types/community"
import type { CommunityPageRecord } from "../../types/community"

function readQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

function titleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatLocalizedCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(value)
}

export function useCommunityPageDetail(
  slugSource: MaybeRefOrGetter<string>,
  querySource?: MaybeRefOrGetter<Record<string, unknown>>,
) {
  const { t, te, locale } = useI18n()
  const { posts } = useMockSocialData()
  const translateValue = (value?: string, fallback = "") => {
    if (!value) return fallback
    return te(value) ? t(value) : value
  }

  const slug = computed(() => String(toValue(slugSource) || "").trim())
  const query = computed(() =>
    querySource ? (toValue(querySource) as Record<string, unknown>) : {},
  )

  const page = computed<CommunityPageRecord | null>(() => {
    const basePage = getCommunityPageBySlug(slug.value)
    const queryName = readQueryValue(query.value.name).trim()
    const queryDescription = readQueryValue(query.value.description).trim()
    const queryCategory = readQueryValue(query.value.category).trim()

    const resolvedName =
      queryName
      || basePage?.name
      || (slug.value ? titleFromSlug(slug.value) : "")

    const resolvedSlug =
      slug.value
      || basePage?.slug
      || createCommunitySlug(resolvedName)
      || "fanpage-moi"

    if (!resolvedSlug && !resolvedName && !basePage) return null

    const resolvedCategory =
      queryCategory
      || basePage?.category
      || "local-business"

    return {
      id: basePage?.id ?? 0,
      name: resolvedName || t("pages.pageDetailPage.newPageName"),
      slug: resolvedSlug,
      summary:
        queryDescription
        || basePage?.summary
        || t("pages.pageDetailPage.previewSummary"),
      category: resolvedCategory,
      banner:
        basePage?.banner
        || "linear-gradient(135deg,#0f172a_0%,#0000ff_42%,#93c5fd_100%)",
      accent: basePage?.accent || "#0000ff",
      followers: basePage?.followers ?? 0,
      likes: basePage?.likes ?? 0,
      ownerLabel: basePage?.ownerLabel || t("pages.pageDetailPage.previewOwnerLabel"),
      responseLabel: basePage?.responseLabel || t("pages.pageDetailPage.previewResponseLabel"),
      website: basePage?.website || `vnseea.vn/p/${resolvedSlug}`,
      locationLabel: basePage?.locationLabel || t("pages.pageDetailPage.previewLocationLabel"),
      foundedLabel: basePage?.foundedLabel || t("pages.pageDetailPage.previewFoundedLabel"),
      ctaLabel: basePage?.ctaLabel || t("pages.pageDetailPage.previewCtaLabel"),
      canManage: basePage?.canManage ?? true,
      tags:
        basePage?.tags?.length
          ? basePage.tags
          : [resolvedCategory, "fanpage", "community"].filter(Boolean),
    }
  })

  const categoryLabel = computed(() =>
    t(`pages.pageDetailPage.categories.${page.value?.category || "local-business"}`),
  )

  const followerCountLabel = computed(() =>
    t("pages.pageDetailPage.followerCount", {
      count: formatLocalizedCount(page.value?.followers ?? 0, locale.value),
    }),
  )

  const likeCountLabel = computed(() =>
    t("pages.pageDetailPage.likeCount", {
      count: formatLocalizedCount(page.value?.likes ?? 0, locale.value),
    }),
  )

  const pagePosts = computed(() => {
    if (!page.value) return []

    return posts.slice(0, 3).map((post, index) => {
      const pageName = translateValue(page.value?.name)
      const pageOwnerLabel = translateValue(page.value?.ownerLabel)
      const localizedTags = page.value.tags.map(tag => translateValue(tag)).filter(Boolean)
      const tag = localizedTags[index % Math.max(localizedTags.length, 1)] || "fanpage"

      return {
        ...post,
        id: page.value.id * 100 + index + 1,
        author: pageName,
        role: index === 0
          ? pageOwnerLabel
          : t("pages.pageDetailPage.postRole", { category: categoryLabel.value }),
        audience: pageName,
        time: index === 0
          ? t("pages.pageDetailPage.postTime1")
          : index === 1
            ? t("pages.pageDetailPage.postTime2")
            : t("pages.pageDetailPage.postTime3"),
        text:
          index === 0
            ? t("pages.pageDetailPage.postText1", { page: pageName, tag })
            : index === 1
              ? t("pages.pageDetailPage.postText2", { page: pageName })
              : t("pages.pageDetailPage.postText3", { page: pageName }),
        tags: Array.from(
          new Set([
            `#${tag}`,
            ...localizedTags.map(item => `#${item}`),
            ...post.tags,
          ]),
        ).slice(0, 4),
      }
    })
  })

  return {
    slug,
    page,
    categoryLabel,
    followerCountLabel,
    likeCountLabel,
    pagePosts,
  }
}
