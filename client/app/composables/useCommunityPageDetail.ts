import { computed, toValue, type MaybeRefOrGetter } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"
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
  const { t, tm, rt, locale } = useI18n()
  const { posts } = useMockSocialData()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const slug = computed(() => String(toValue(slugSource) || "").trim())
  const query = computed(() =>
    querySource ? (toValue(querySource) as Record<string, unknown>) : {},
  )

  const pageDictionary = computed(() =>
    localized<Record<string, Partial<CommunityPageRecord>>>("pages.pageDetailPage.pages"),
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

    const localizedBasePage = basePage
      ? {
          ...basePage,
          ...(pageDictionary.value?.[basePage.slug] ?? {}),
        }
      : null

    return {
      id: localizedBasePage?.id ?? 0,
      name: resolvedName || t("pages.pageDetailPage.newPageName"),
      slug: resolvedSlug,
      summary:
        queryDescription
        || localizedBasePage?.summary
        || t("pages.pageDetailPage.previewSummary"),
      category: resolvedCategory,
      banner:
        localizedBasePage?.banner
        || "linear-gradient(135deg,#0f172a_0%,#0000ff_42%,#93c5fd_100%)",
      accent: localizedBasePage?.accent || "#0000ff",
      followers: localizedBasePage?.followers ?? 0,
      likes: localizedBasePage?.likes ?? 0,
      ownerLabel: localizedBasePage?.ownerLabel || t("pages.pageDetailPage.previewOwnerLabel"),
      responseLabel: localizedBasePage?.responseLabel || t("pages.pageDetailPage.previewResponseLabel"),
      website: localizedBasePage?.website || `vnseea.vn/p/${resolvedSlug}`,
      locationLabel: localizedBasePage?.locationLabel || t("pages.pageDetailPage.previewLocationLabel"),
      foundedLabel: localizedBasePage?.foundedLabel || t("pages.pageDetailPage.previewFoundedLabel"),
      ctaLabel: localizedBasePage?.ctaLabel || t("pages.pageDetailPage.previewCtaLabel"),
      canManage: localizedBasePage?.canManage ?? true,
      tags:
        localizedBasePage?.tags?.length
          ? localizedBasePage.tags
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
      const tag = page.value?.tags[index % Math.max(page.value.tags.length, 1)] || "fanpage"

      return {
        ...post,
        id: page.value.id * 100 + index + 1,
        author: page.value.name,
        role: index === 0
          ? page.value.ownerLabel
          : t("pages.pageDetailPage.postRole", { category: categoryLabel.value }),
        audience: page.value.name,
        time: index === 0
          ? t("pages.pageDetailPage.postTime1")
          : index === 1
            ? t("pages.pageDetailPage.postTime2")
            : t("pages.pageDetailPage.postTime3"),
        text:
          index === 0
            ? t("pages.pageDetailPage.postText1", { page: page.value.name, tag })
            : index === 1
              ? t("pages.pageDetailPage.postText2", { page: page.value.name })
              : t("pages.pageDetailPage.postText3", { page: page.value.name }),
        tags: Array.from(
          new Set([
            `#${tag}`,
            ...page.value.tags.map(item => `#${item}`),
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
