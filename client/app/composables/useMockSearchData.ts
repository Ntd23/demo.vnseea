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
  const { t } = useI18n()
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
    "#0369a1",
    "#92400e",
    "#7c3aed",
    "#c2410c",
    "#0369a1",
    "#4338ca",
  ]

  const resultsByType = computed(() => {
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
        subtitle: t("community.search.mock.users.contactSubtitle", { handle }),
        description: contact.online
          ? t("community.search.mock.users.contactDescOnline")
          : t("community.search.mock.users.contactDescOffline"),
        href: createProfilePath(contact.name),
        initials: contact.avatar || toInitials(contact.name),
        badge: contact.online ? t("community.search.mock.badge.online") : undefined,
        metricLabel: contact.online ? t("community.search.mock.metrics.canChat") : t("community.search.mock.metrics.inContacts"),
        metaLabel: contact.online ? t("community.search.mock.metrics.quickResponse") : t("community.search.mock.metrics.recentContact"),
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
        subtitle: t("community.search.mock.users.suggestedSubtitle", { handle, role: user.role }),
        description: t("community.search.mock.users.suggestedDesc", { mutual: user.mutual }),
        href: createProfilePath(user.name),
        initials: user.avatar || toInitials(user.name),
        badge: t("community.search.mock.badge.suggested"),
        metricLabel: t("community.search.mock.metrics.mutualFriends", { count: user.mutual }),
        metaLabel: t("community.search.mock.metrics.recentContact"),
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
          subtitle: t("community.search.mock.users.memberSubtitle", { handle, role: member.role }),
          description: t("community.search.mock.users.memberDesc", {
            meta: member.meta,
            group: group.name,
            topic: group.tags[0] || "community",
          }),
          href: createProfilePath(member.name),
          initials: member.initials || toInitials(member.name),
          badge: member.online ? t("community.search.mock.badge.online") : t("community.search.mock.badge.member"),
          metricLabel: group.name,
          metaLabel: member.online ? t("community.search.mock.metrics.activeInGroup") : group.activityLabel,
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
      const categoryLabel = t(getCommunityOptionLabel(
        communityPageCategoryOptions,
        page.category,
        "Fanpage",
      ))

      return {
        id: `page-${page.id}`,
        kind: "pages" as const,
        title: page.name,
        subtitle: t("community.search.mock.pages.subtitle", { category: categoryLabel, slug: page.slug }),
        description: page.summary,
        href: getCommunityPagePath(page.slug),
        initials: toInitials(page.name),
        badge: page.canManage ? t("community.search.mock.badge.managed") : t("community.search.mock.badge.suggested"),
        metricLabel: t("community.search.mock.metrics.followers", { count: formatCommunityFollowerCount(page.followers) }),
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
      const categoryLabel = t(getCommunityOptionLabel(
        communityCategoryOptions,
        group.category,
        "Cộng đồng",
      ))

      const privacyLabel = t(getCommunityOptionLabel(
        communityPrivacyOptions,
        group.privacy,
        "Nhóm",
      ))

      return {
        id: `group-${group.id}`,
        kind: "groups" as const,
        title: group.name,
        subtitle: t("community.search.mock.groups.subtitle", { privacy: privacyLabel, category: categoryLabel }),
        description: group.summary,
        href: getCommunityGroupPath(group.slug),
        initials: toInitials(group.name),
        badge: group.segment === "joined" ? t("community.search.mock.badge.joined") : t("community.search.mock.badge.suggested"),
        metricLabel: t("community.search.mock.metrics.members", { count: formatCommunityMemberCount(group.members) }),
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
      subtitle: t("community.search.mock.posts.subtitle", { time: post.time }),
      description: post.text,
      href: "/home",
      initials: toInitials(post.author),
      badge: post.audience === "Public" ? t("community.search.mock.badge.public") : t("community.search.mock.badge.private"),
      metricLabel: t("community.search.mock.metrics.likes", { count: post.stats.likes }),
      metaLabel: `${t("community.search.mock.metrics.comments", { count: post.stats.comments })} · ${t("community.search.mock.metrics.shares", { count: post.stats.shares })}`,
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
      users,
      pages,
      groups,
      posts: postsResults,
    } satisfies Record<SearchCollectionType, SearchResultItem[]>
  })

  return {
    quickKeywords,
    searchTabs,
    searchTypeOptions,
    searchSortOptions,
    resultsByType,
  }
}
