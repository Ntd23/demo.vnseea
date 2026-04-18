import { communityPageDirectory, createCommunitySlug } from "../../types/community"
import { createHashtagPath } from "./useMockHashtagData"
import { useMockSocialData } from "./useMockSocialData"

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
  const { contacts, posts, suggestedUsers, widgets } = useMockSocialData()

  const exploreViewOptions: ExploreViewOption[] = [
    {
      label: "Tất cả",
      value: "all",
      icon: "i-ph-squares-four-fill",
      description: "Hiển thị đồng thời bài viết, kết nối và fanpage đang đáng chú ý nhất.",
    },
    {
      label: "Bài viết",
      value: "posts",
      icon: "i-ph-newspaper-clipping-fill",
      description: "Ưu tiên các bài đăng đang có tương tác cao trong social mock hiện tại.",
    },
    {
      label: "Người dùng",
      value: "users",
      icon: "i-ph-user-circle-fill",
      description: "Gợi ý hồ sơ dựa trên bạn chung, vai trò và hoạt động gần đây.",
    },
    {
      label: "Fanpage",
      value: "pages",
      icon: "i-ph-flag-fill",
      description: "Các trang nội dung và thương hiệu phù hợp để theo dõi tiếp.",
    },
  ]

  const recommendedUsers = [
    ...suggestedUsers.map((user, index) => ({
      id: `suggested-${user.id}`,
      name: user.name,
      initials: user.avatar,
      role: user.role,
      href: createProfilePath(user.name),
      mutualLabel: `${user.mutual} bạn chung`,
      meta: "Gợi ý từ mạng lưới tương tác gần đây",
      reason: user.mutual >= 8
        ? "Có nhiều kết nối trùng và chủ đề chuyên môn gần với nội dung bạn đang theo dõi."
        : "Phù hợp với các chủ đề bạn từng quan tâm trong search và hashtag.",
      tags: [user.role, "Kết nối mới"],
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
        role: "Đang hoạt động",
        href: createProfilePath(contact.name),
        mutualLabel: `${index + 2} bạn chung`,
        meta: "Xuất hiện trong danh sách chat đang online",
        reason: "Có mặt trong mạng lưới liên hệ trực tiếp, phù hợp để mở kết nối nhanh.",
        tags: ["Online", "Trao đổi nhanh"],
        accent: accentPalette[(suggestedUsers.length + index) % accentPalette.length],
        online: true,
      })),
  ]

  const recommendedPages = [...communityPageDirectory]
    .sort((left, right) => right.followers - left.followers)
    .slice(0, 3)

  const recommendedPosts = [...posts]
    .sort((left, right) => getPostScore(right) - getPostScore(left))

  const hashtagScoreMap = new Map<string, { label: string; score: number }>()

  recommendedPosts.forEach((post) => {
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

  const trendingHashtags: ExploreHashtag[] = Array.from(hashtagScoreMap.entries())
    .map(([slug, item]) => ({
      slug,
      label: item.label,
      score: item.score,
      to: createHashtagPath(slug),
    }))
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label, "vi"))
    .slice(0, 6)

  const summaryCards: ExploreSummaryCard[] = [
    {
      label: "Bài viết đề xuất",
      value: recommendedPosts.length.toLocaleString("vi-VN"),
      description: "Các bài đang có mức tương tác tốt nhất trong social mock.",
      icon: "i-ph-newspaper-clipping-fill",
    },
    {
      label: "Kết nối gợi ý",
      value: recommendedUsers.length.toLocaleString("vi-VN"),
      description: "Hồ sơ được gom từ suggested users và liên hệ đang hoạt động.",
      icon: "i-ph-users-three-fill",
    },
    {
      label: "Fanpage nên theo dõi",
      value: recommendedPages.length.toLocaleString("vi-VN"),
      description: "Trang cộng đồng và thương hiệu phù hợp để mở sâu hơn.",
      icon: "i-ph-flag-fill",
    },
  ]

  return {
    exploreViewOptions,
    summaryCards,
    recommendedPosts,
    recommendedUsers,
    recommendedPages,
    trendingHashtags,
  }
}
