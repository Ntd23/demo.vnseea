import { communityPageDirectory, createCommunitySlug } from "../../types/community"
import { createHashtagPath } from "./useMockHashtagData"
import { useMockSocialData } from "./useMockSocialData"
import { computed } from "vue"

type SocialData = ReturnType<typeof useMockSocialData>
type SocialPost = SocialData["posts"][number]

export type ExploreView = "all" | "posts" | "users" | "pages"

export interface ExploreViewOption {
  label: string
  value: ExploreView
  icon: string
  description: string
}

export interface ExploreSummaryCard {
  label: string
  value: string
  description: string
  icon: string
}

export interface ExploreUserSpotlight {
  id: string
  name: string
  initials: string
  role: string
  href: string
  mutualLabel: string
  meta: string
  reason: string
  tags: string[]
  accent: string
  online?: boolean
}

export interface ExploreHashtag {
  slug: string
  label: string
  score: number
  to: string
}

function createProfilePath(name: string) {
  return `/@${createCommunitySlug(name) || "member"}`
}

function normalizeTag(value: string) {
  return createCommunitySlug(String(value || "").replace(/^#/, "").trim())
}

function readNumberFromSubtitle(value: string) {
  const matched = value.match(/\d+/)
  return matched ? Number(matched[0]) : 12
}

function getPostScore(post: SocialPost) {
  return post.stats.likes + post.stats.comments * 2 + post.stats.shares * 3
}

const accentPalette = [
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#1d4ed8",
]

export function useMockExploreData() {
  const { t, locale } = useI18n()
  const { contacts, posts, suggestedUsers, widgets } = useMockSocialData()
  const formatCount = (value: number) =>
    value.toLocaleString(locale.value === "vi" ? "vi-VN" : "en-US")

  const exploreViewOptions = computed<ExploreViewOption[]>(() => [
    {
      label: t("pages.explorePage.viewAllLabel"),
      value: "all",
      icon: "i-ph-squares-four-fill",
      description: t("pages.explorePage.viewAllDescription"),
    },
    {
      label: t("pages.explorePage.viewPostsLabel"),
      value: "posts",
      icon: "i-ph-newspaper-clipping-fill",
      description: t("pages.explorePage.viewPostsDescription"),
    },
    {
      label: t("pages.explorePage.viewUsersLabel"),
      value: "users",
      icon: "i-ph-user-circle-fill",
      description: t("pages.explorePage.viewUsersDescription"),
    },
    {
      label: t("pages.explorePage.viewPagesLabel"),
      value: "pages",
      icon: "i-ph-flag-fill",
      description: t("pages.explorePage.viewPagesDescription"),
    },
  ])

  const recommendedUsers = computed<ExploreUserSpotlight[]>(() => [
    ...suggestedUsers.map((user, index) => ({
      id: `suggested-${user.id}`,
      name: user.name,
      initials: user.avatar,
      role: user.role,
      href: createProfilePath(user.name),
      mutualLabel: t("pages.explorePage.mutualFriends", { count: user.mutual }),
      meta: t("pages.explorePage.suggestionMeta"),
      reason: user.mutual >= 8
        ? t("pages.explorePage.highMutualReason")
        : t("pages.explorePage.defaultUserReason"),
      tags: [user.role, t("pages.explorePage.newConnectionTag")],
      accent: accentPalette[index % accentPalette.length],
      online: index % 2 === 0,
    })),
    ...contacts
      .filter(contact => contact.online)
      .slice(0, 2)
      .map((contact, index) => ({
        id: `contact-${contact.id}`,
        name: contact.name,
        initials: contact.avatar,
        role: t("pages.explorePage.activeNow"),
        href: createProfilePath(contact.name),
        mutualLabel: t("pages.explorePage.mutualFriends", { count: index + 2 }),
        meta: t("pages.explorePage.onlineMeta"),
        reason: t("pages.explorePage.onlineReason"),
        tags: [t("pages.explorePage.onlineTag"), t("pages.explorePage.quickChatTag")],
        accent: accentPalette[(suggestedUsers.length + index) % accentPalette.length],
        online: true,
      })),
  ])

  const recommendedPages = computed(() =>
    [...communityPageDirectory]
      .sort((left, right) => right.followers - left.followers)
      .slice(0, 3),
  )

  const recommendedPosts = computed(() =>
    [...posts]
      .sort((left, right) => getPostScore(right) - getPostScore(left)),
  )

  const trendingHashtags = computed<ExploreHashtag[]>(() => {
    const hashtagScoreMap = new Map<string, { label: string; score: number }>()

    recommendedPosts.value.forEach((post) => {
      const score = getPostScore(post)

      post.tags.forEach((tag) => {
        const slug = normalizeTag(tag)
        if (!slug) return

        const existing = hashtagScoreMap.get(slug)
        if (existing) {
          existing.score += score
          return
        }

        hashtagScoreMap.set(slug, {
          label: tag.replace(/^#/, "").trim(),
          score,
        })
      })
    })

    widgets
      .flatMap(section => section.items)
      .filter(item => item.title.startsWith("#"))
      .forEach((item) => {
        const slug = normalizeTag(item.title)
        if (!slug) return

        const score = readNumberFromSubtitle(item.subtitle)
        const existing = hashtagScoreMap.get(slug)

        if (existing) {
          existing.score += score
          return
        }

        hashtagScoreMap.set(slug, {
          label: item.title.replace(/^#/, "").trim(),
          score,
        })
      })

    return Array.from(hashtagScoreMap.entries())
      .map(([slug, item]) => ({
        slug,
        label: item.label,
        score: item.score,
        to: createHashtagPath(slug),
      }))
      .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label, locale.value === "vi" ? "vi" : "en"))
      .slice(0, 6)
  })

  const summaryCards = computed<ExploreSummaryCard[]>(() => [
    {
      label: t("pages.explorePage.summaryPosts"),
      value: formatCount(recommendedPosts.value.length),
      description: t("pages.explorePage.summaryPostsDescription"),
      icon: "i-ph-newspaper-clipping-fill",
    },
    {
      label: t("pages.explorePage.summaryUsers"),
      value: formatCount(recommendedUsers.value.length),
      description: t("pages.explorePage.summaryUsersDescription"),
      icon: "i-ph-users-three-fill",
    },
    {
      label: t("pages.explorePage.summaryPages"),
      value: formatCount(recommendedPages.value.length),
      description: t("pages.explorePage.summaryPagesDescription"),
      icon: "i-ph-flag-fill",
    },
  ])

  return {
    exploreViewOptions,
    summaryCards,
    recommendedPosts,
    recommendedUsers,
    recommendedPages,
    trendingHashtags,
  }
}
