export type DirectoryCategoryKey =
  | "all"
  | "users"
  | "pages"
  | "groups"
  | "market"
  | "events"
  | "jobs"
  | "blogs"
  | "funding"
  | "live"
  | "watch"
  | "games"
  | "forum"

export type DirectoryCategory = {
  label: string
  value: DirectoryCategoryKey
  icon: string
  description: string
}

export type DirectoryItem = {
  id: string
  title: string
  category: Exclude<DirectoryCategoryKey, "all">
  categoryLabel: string
  description: string
  meta: string
  count: string
  href: string
  accent: string
  tags: string[]
  featured: boolean
}

export const useMockDirectoryData = () => {
  const categories: DirectoryCategory[] = [
    { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill", description: "Toàn bộ danh mục" },
    { label: "Users", value: "users", icon: "i-ph-user-circle-fill", description: "Thành viên nổi bật" },
    { label: "Pages", value: "pages", icon: "i-ph-flag-fill", description: "Fanpage và trang cộng đồng" },
    { label: "Groups", value: "groups", icon: "i-ph-users-three-fill", description: "Nhóm đang hoạt động" },
    { label: "Market", value: "market", icon: "i-ph-storefront-fill", description: "Marketplace" },
    { label: "Events", value: "events", icon: "i-ph-calendar-dots-fill", description: "Sự kiện" },
    { label: "Jobs", value: "jobs", icon: "i-ph-briefcase-fill", description: "Việc làm" },
    { label: "Blogs", value: "blogs", icon: "i-ph-newspaper-fill", description: "Bài viết dài" },
    { label: "Funding", value: "funding", icon: "i-ph-hand-heart-fill", description: "Gây quỹ" },
    { label: "Live", value: "live", icon: "i-ph-broadcast-fill", description: "Livestream" },
    { label: "Watch", value: "watch", icon: "i-ph-play-circle-fill", description: "Video" },
    { label: "Games", value: "games", icon: "i-ph-game-controller-fill", description: "Trò chơi" },
    { label: "Forum", value: "forum", icon: "i-ph-chats-circle-fill", description: "Thảo luận" },
  ]

  const items: DirectoryItem[] = [
    {
      id: "top-creators",
      title: "Top creators",
      category: "users",
      categoryLabel: "Users",
      description: "Những thành viên có nhiều nội dung, phản hồi và kết nối nhất tuần này.",
      meta: "128 hồ sơ",
      count: "24 online",
      href: "/search?type=users",
      accent: "linear-gradient(135deg,var(--color-primary-500),var(--color-info))",
      tags: ["#users", "#creator"],
      featured: true,
    },
    {
      id: "community-pages",
      title: "Trang cộng đồng",
      category: "pages",
      categoryLabel: "Pages",
      description: "Fanpage đang tăng trưởng, trang yêu thích và các trang được đề xuất.",
      meta: "42 trang",
      count: "8 mới",
      href: "/pages",
      accent: "linear-gradient(135deg,var(--color-accent-500),var(--color-primary-600))",
      tags: ["#pages", "#brand"],
      featured: true,
    },
    {
      id: "active-groups",
      title: "Nhóm đang hoạt động",
      category: "groups",
      categoryLabel: "Groups",
      description: "Nhóm của tôi, nhóm đề xuất và các cộng đồng có thảo luận mới.",
      meta: "36 nhóm",
      count: "1,2K thành viên",
      href: "/groups",
      accent: "linear-gradient(135deg,var(--color-success),var(--color-primary-500))",
      tags: ["#groups", "#community"],
      featured: false,
    },
    {
      id: "market-deals",
      title: "Marketplace deals",
      category: "market",
      categoryLabel: "Market",
      description: "Sản phẩm nổi bật, shop gần bạn và danh mục đang có nhiều lượt xem.",
      meta: "316 sản phẩm",
      count: "18 deal",
      href: "/products",
      accent: "linear-gradient(135deg,var(--color-primary-700),var(--color-accent-500))",
      tags: ["#market", "#shop"],
      featured: true,
    },
    {
      id: "upcoming-events",
      title: "Sự kiện sắp diễn ra",
      category: "events",
      categoryLabel: "Events",
      description: "Workshop, meetup, summit và các event được nhiều người quan tâm.",
      meta: "12 sự kiện",
      count: "642 quan tâm",
      href: "/events",
      accent: "linear-gradient(135deg,var(--color-error),var(--color-primary-500))",
      tags: ["#events", "#networking"],
      featured: false,
    },
    {
      id: "hiring-board",
      title: "Hiring board",
      category: "jobs",
      categoryLabel: "Jobs",
      description: "Tin tuyển dụng mới, job remote và các công ty đang tuyển.",
      meta: "27 jobs",
      count: "9 remote",
      href: "/jobs",
      accent: "linear-gradient(135deg,var(--color-primary-500),var(--color-success))",
      tags: ["#jobs", "#hiring"],
      featured: false,
    },
    {
      id: "blog-index",
      title: "Blog index",
      category: "blogs",
      categoryLabel: "Blogs",
      description: "Danh sách blog, bài của tôi, bài nổi bật và bộ lọc nội dung.",
      meta: "84 bài",
      count: "16 mới",
      href: "/blogs",
      accent: "linear-gradient(135deg,var(--color-info),var(--color-primary-600))",
      tags: ["#blogs", "#writing"],
      featured: false,
    },
    {
      id: "funding-hub",
      title: "Funding hub",
      category: "funding",
      categoryLabel: "Funding",
      description: "Chiến dịch crowdfunding, donor list và tiến độ gây quỹ.",
      meta: "8 campaign",
      count: "312 donors",
      href: "/funding",
      accent: "linear-gradient(135deg,var(--color-success),var(--color-accent-500))",
      tags: ["#funding", "#impact"],
      featured: true,
    },
    {
      id: "live-center",
      title: "Live center",
      category: "live",
      categoryLabel: "Live",
      description: "Các phiên livestream, chat realtime mock và Go Live.",
      meta: "3 kênh",
      count: "1,9K viewers",
      href: "/live",
      accent: "linear-gradient(135deg,var(--color-error),var(--color-accent-500))",
      tags: ["#live", "#stream"],
      featured: false,
    },
    {
      id: "watch-library",
      title: "Watch library",
      category: "watch",
      categoryLabel: "Watch",
      description: "Video dài, related videos, comments và like/share.",
      meta: "64 video",
      count: "92K views",
      href: "/watch",
      accent: "linear-gradient(135deg,var(--color-primary-500),var(--color-primary-900))",
      tags: ["#watch", "#video"],
      featured: false,
    },
    {
      id: "game-arcade",
      title: "Game arcade",
      category: "games",
      categoryLabel: "Games",
      description: "Game của tôi, game mới, game phổ biến và bảng xếp hạng.",
      meta: "9 game",
      count: "114K plays",
      href: "/games",
      accent: "linear-gradient(135deg,var(--color-accent-500),var(--color-error))",
      tags: ["#games", "#leaderboard"],
      featured: false,
    },
    {
      id: "forum-sections",
      title: "Forum sections",
      category: "forum",
      categoryLabel: "Forum",
      description: "Sections, thread, reply và các câu hỏi mới của cộng đồng.",
      meta: "6 sections",
      count: "76 replies",
      href: "/forum",
      accent: "linear-gradient(135deg,var(--color-primary-600),var(--color-info))",
      tags: ["#forum", "#qa"],
      featured: false,
    },
  ]

  return { categories, items }
}
