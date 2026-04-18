import {
  communityCategoryOptions,
  communityGroupDirectory,
  communityGroupMembers,
  communityPageCategoryOptions,
  communityPageDirectory,
  communityPrivacyOptions,
  createCommunitySlug,
  formatCommunityFollowerCount,
  formatCommunityMemberCount,
  getCommunityGroupPath,
  getCommunityOptionLabel,
  getCommunityPagePath,
} from "../../types/community"
import { useMockSocialData } from "./useMockSocialData"

export type SearchResultType = "all" | "users" | "pages" | "groups" | "posts"
export type SearchCollectionType = Exclude<SearchResultType, "all">
export type SearchSortKey = "relevance" | "popular" | "recent"

export interface SearchOption<T extends string = string> {
  label: string
  value: T
}

export interface SearchTabItem {
  label: string
  value: SearchResultType
  icon: string
  description: string
}

export interface SearchResultItem {
  id: string
  kind: SearchCollectionType
  title: string
  subtitle: string
  description: string
  href: string
  initials: string
  badge?: string
  metricLabel: string
  metaLabel?: string
  tags: string[]
  searchableText: string
  accent: string
  popularityScore: number
  recentScore: number
}

function toInitials(value: string, limit = 2) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, limit)
    .map(part => part[0]?.toUpperCase() || "")
    .join("")
}

function createProfilePath(name: string) {
  return `/@${createCommunitySlug(name) || "member"}`
}

function normalizeTag(value: string) {
  return value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
}

function createSearchableText(parts: Array<string | string[] | undefined>) {
  return parts
    .flatMap(part => Array.isArray(part) ? part : [part || ""])
    .join(" ")
    .toLowerCase()
}

export function useMockSearchData() {
  const { contacts, suggestedUsers, posts } = useMockSocialData()

  const searchTypeOptions: SearchOption<SearchResultType>[] = [
    { label: "Tất cả kết quả", value: "all" },
    { label: "Người dùng", value: "users" },
    { label: "Các trang", value: "pages" },
    { label: "Các nhóm", value: "groups" },
    { label: "Bài đăng", value: "posts" },
  ]

  const searchSortOptions: SearchOption<SearchSortKey>[] = [
    { label: "Phù hợp nhất", value: "relevance" },
    { label: "Phổ biến", value: "popular" },
    { label: "Mới cập nhật", value: "recent" },
  ]

  const searchTabs: SearchTabItem[] = [
    {
      label: "Tất cả",
      value: "all",
      icon: "i-ph-squares-four-fill",
      description: "Gộp người dùng, trang, nhóm và bài đăng.",
    },
    {
      label: "Người dùng",
      value: "users",
      icon: "i-ph-user-circle-fill",
      description: "Tìm thành viên, liên hệ và đề xuất kết nối.",
    },
    {
      label: "Các trang",
      value: "pages",
      icon: "i-ph-flag-fill",
      description: "Tìm fanpage, thương hiệu và cộng đồng nội dung.",
    },
    {
      label: "Các nhóm",
      value: "groups",
      icon: "i-ph-users-three-fill",
      description: "Khám phá cộng đồng đang hoạt động trong hệ sinh thái.",
    },
    {
      label: "Bài đăng",
      value: "posts",
      icon: "i-ph-newspaper-clipping-fill",
      description: "Tìm thảo luận, recap và cập nhật mới nhất.",
    },
  ]

  const quickKeywords = [
    "AI product",
    "xe điện",
    "workshop",
    "mobility",
    "#automation",
    "#learning",
  ]

  const accentPalette = [
    "#1d4ed8",
    "#0000ff",
    "#0f766e",
    "#92400e",
    "#7c3aed",
    "#c2410c",
    "#0f766e",
    "#4338ca",
  ]

  const usersMap = new Map<string, SearchResultItem>()

  const upsertUser = (item: SearchResultItem) => {
    const existing = usersMap.get(item.id)

    if (!existing) {
      usersMap.set(item.id, item)
      return
    }

    usersMap.set(item.id, {
      ...existing,
      badge: existing.badge || item.badge,
      description: existing.description.length >= item.description.length ? existing.description : item.description,
      metaLabel: existing.metaLabel || item.metaLabel,
      metricLabel: existing.metricLabel.length >= item.metricLabel.length ? existing.metricLabel : item.metricLabel,
      popularityScore: Math.max(existing.popularityScore, item.popularityScore),
      recentScore: Math.max(existing.recentScore, item.recentScore),
      searchableText: `${existing.searchableText} ${item.searchableText}`.trim(),
      tags: Array.from(new Set([...existing.tags, ...item.tags])).slice(0, 5),
    })
  }

  contacts.forEach((contact, index) => {
    const handle = createCommunitySlug(contact.name) || `contact-${contact.id}`
    upsertUser({
      id: handle,
      kind: "users",
      title: contact.name,
      subtitle: `@${handle} · Liên hệ trong mạng lưới`,
      description: contact.online
        ? "Đang hoạt động và có thể mở cuộc trò chuyện ngay từ chat widget."
        : "Đã xuất hiện trong danh bạ gần đây và có thể mời vào hội thoại mới.",
      href: createProfilePath(contact.name),
      initials: contact.avatar || toInitials(contact.name),
      badge: contact.online ? "Online" : undefined,
      metricLabel: contact.online ? "Có thể trò chuyện ngay" : "Có trong danh bạ của bạn",
      metaLabel: contact.online ? "Phản hồi nhanh qua chat" : "Liên hệ gần đây",
      tags: ["ban-be", contact.online ? "online" : "lien-he"],
      searchableText: createSearchableText([
        contact.name,
        handle,
        "Liên hệ trong mạng lưới",
        contact.online ? "online" : "offline",
      ]),
      accent: accentPalette[index % accentPalette.length],
      popularityScore: contact.online ? 82 - index : 58 - index,
      recentScore: 100 - index,
    })
  })

  suggestedUsers.forEach((user, index) => {
    const handle = createCommunitySlug(user.name) || `suggested-${user.id}`
    upsertUser({
      id: handle,
      kind: "users",
      title: user.name,
      subtitle: `@${handle} · ${user.role}`,
      description: `${user.mutual} bạn chung trong hệ sinh thái VNSEEA. Đây là kết nối phù hợp để mở rộng network hoặc trao đổi công việc.`,
      href: createProfilePath(user.name),
      initials: user.avatar || toInitials(user.name),
      badge: "Gợi ý",
      metricLabel: `${user.mutual} bạn chung`,
      metaLabel: "Đề xuất theo mạng lưới hiện tại",
      tags: [normalizeTag(user.role), "goi-y-ket-noi"],
      searchableText: createSearchableText([
        user.name,
        handle,
        user.role,
        `${user.mutual} bạn chung`,
      ]),
      accent: accentPalette[(index + contacts.length) % accentPalette.length],
      popularityScore: 60 + user.mutual * 6,
      recentScore: 88 - index,
    })
  })

  Object.entries(communityGroupMembers).forEach(([slug, members], groupIndex) => {
    const group = communityGroupDirectory.find(item => item.slug === slug)
    if (!group) return

    members.forEach((member, memberIndex) => {
      const handle = createCommunitySlug(member.name) || `member-${member.id}`
      upsertUser({
        id: handle,
        kind: "users",
        title: member.name,
        subtitle: `@${handle} · ${member.role}`,
        description: `${member.meta}. Thành viên của ${group.name}, phù hợp nếu bạn đang tìm người cùng chủ đề ${group.tags[0] || "community"}.`,
        href: createProfilePath(member.name),
        initials: member.initials || toInitials(member.name),
        badge: member.online ? "Online" : "Trong nhóm",
        metricLabel: group.name,
        metaLabel: member.online ? "Đang hoạt động trong nhóm" : group.activityLabel,
        tags: [
          normalizeTag(group.tags[0] || group.name),
          normalizeTag(member.role),
          "thanh-vien-nhom",
        ],
        searchableText: createSearchableText([
          member.name,
          handle,
          member.role,
          member.meta,
          group.name,
          group.tags,
        ]),
        accent: accentPalette[(groupIndex + memberIndex + 2) % accentPalette.length],
        popularityScore: 52 + (member.online ? 18 : 0) + Math.max(0, 8 - memberIndex),
        recentScore: 76 - groupIndex * 4 - memberIndex,
      })
    })
  })

  const users = Array.from(usersMap.values())

  const pages = communityPageDirectory.map((page, index) => {
    const categoryLabel = getCommunityOptionLabel(
      communityPageCategoryOptions,
      page.category,
      "Fanpage",
    )

    return {
      id: `page-${page.id}`,
      kind: "pages" as const,
      title: page.name,
      subtitle: `${categoryLabel} · /p/${page.slug}`,
      description: page.summary,
      href: getCommunityPagePath(page.slug),
      initials: toInitials(page.name),
      badge: page.canManage ? "Bạn quản lý" : "Đề xuất",
      metricLabel: formatCommunityFollowerCount(page.followers),
      metaLabel: page.responseLabel,
      tags: page.tags.map(normalizeTag),
      searchableText: createSearchableText([
        page.name,
        page.slug,
        page.summary,
        categoryLabel,
        page.tags,
      ]),
      accent: page.accent,
      popularityScore: page.followers + Math.round(page.likes / 2),
      recentScore: 72 - index * 5,
    }
  })

  const groups = communityGroupDirectory.map((group, index) => {
    const categoryLabel = getCommunityOptionLabel(
      communityCategoryOptions,
      group.category,
      "Cộng đồng",
    )

    const privacyLabel = getCommunityOptionLabel(
      communityPrivacyOptions,
      group.privacy,
      "Nhóm",
    )

    return {
      id: `group-${group.id}`,
      kind: "groups" as const,
      title: group.name,
      subtitle: `${privacyLabel} · ${categoryLabel}`,
      description: group.summary,
      href: getCommunityGroupPath(group.slug),
      initials: toInitials(group.name),
      badge: group.segment === "joined" ? "Đã tham gia" : "Đề xuất",
      metricLabel: formatCommunityMemberCount(group.members),
      metaLabel: group.activityLabel,
      tags: group.tags.map(normalizeTag),
      searchableText: createSearchableText([
        group.name,
        group.slug,
        group.summary,
        categoryLabel,
        privacyLabel,
        group.tags,
      ]),
      accent: group.accent,
      popularityScore: group.members,
      recentScore: 68 - index * 4,
    }
  })

  const postsResults = posts.map((post, index) => ({
    id: `post-${post.id}`,
    kind: "posts" as const,
    title: post.author,
    subtitle: `Bài đăng · ${post.time}`,
    description: post.text,
    href: "/home",
    initials: toInitials(post.author),
    badge: post.audience,
    metricLabel: `${post.stats.likes} lượt thích`,
    metaLabel: `${post.stats.comments} bình luận · ${post.stats.shares} chia sẻ`,
    tags: post.tags.map(normalizeTag),
    searchableText: createSearchableText([
      post.author,
      post.role,
      post.audience,
      post.text,
      post.tags,
      post.comments.map(comment => comment.text),
    ]),
    accent: accentPalette[(index + 1) % accentPalette.length],
    popularityScore: post.stats.likes * 2 + post.stats.comments * 3 + post.stats.shares * 4,
    recentScore: 92 - index * 7,
  }))

  return {
    quickKeywords,
    searchTabs,
    searchTypeOptions,
    searchSortOptions,
    resultsByType: {
      users,
      pages,
      groups,
      posts: postsResults,
    } satisfies Record<SearchCollectionType, SearchResultItem[]>,
  }
}
