import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type WatchCategoryKey = "all" | "community" | "education" | "business" | "events" | "technology"

export type WatchComment = {
  id: number
  author: string
  initials: string
  role: string
  message: string
  time: string
}

export type WatchVideo = {
  id: string
  title: string
  category: Exclude<WatchCategoryKey, "all">
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  date: string
  duration: string
  views: number
  likes: number
  shares: number
  cover: string
  description: string
  tags: string[]
  comments: WatchComment[]
}

type WatchCategoryOption = {
  label: string
  value: WatchCategoryKey
  icon: string
}

const defaultWatchCategories: WatchCategoryOption[] = [
  { label: "Tất cả", value: "all", icon: "i-ph-squares-four-bold" },
  { label: "Cộng đồng", value: "community", icon: "i-ph-users-three-bold" },
  { label: "Giáo dục", value: "education", icon: "i-ph-graduation-cap-bold" },
  { label: "Kinh doanh", value: "business", icon: "i-ph-briefcase-bold" },
  { label: "Sự kiện", value: "events", icon: "i-ph-calendar-blank-bold" },
  { label: "Công nghệ", value: "technology", icon: "i-ph-cpu-bold" },
]

const defaultWatchVideos: WatchVideo[] = [
  {
    id: "watch-community-demo",
    title: "Demo Day cộng đồng tháng này",
    category: "community",
    categoryLabel: "Cộng đồng",
    author: "VNSEEA Team",
    authorInitials: "VT",
    authorGradient: "from-primary-500 to-secondary-500",
    date: "24 phút trước",
    duration: "24:18",
    views: 1938,
    likes: 126,
    shares: 19,
    cover: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
    description: "Buổi live tổng hợp cập nhật mới của cộng đồng, những phần đang triển khai và các điểm cần mọi người cùng theo dõi trong tuần này.",
    tags: ["#community", "#demo-day", "#updates"],
    comments: [
      {
        id: 101,
        author: "Lan Hương",
        initials: "LH",
        role: "Thành viên",
        message: "Phần recap roadmap hôm nay gọn và dễ theo dõi hơn hẳn.",
        time: "8 phút trước",
      },
      {
        id: 102,
        author: "Minh Quân",
        initials: "MQ",
        role: "Moderator",
        message: "Team có thể ghim luôn tài liệu follow-up ở cuối buổi không?",
        time: "5 phút trước",
      },
    ],
  },
  {
    id: "watch-founder-office-hours",
    title: "Office hours cho founder: giữ nhịp ship sản phẩm",
    category: "business",
    categoryLabel: "Kinh doanh",
    author: "Tuấn Anh",
    authorInitials: "TA",
    authorGradient: "from-secondary-500 to-primary-500",
    date: "11 phút trước",
    duration: "18:42",
    views: 1420,
    likes: 88,
    shares: 12,
    cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
    description: "Trao đổi nhanh về cách chọn ưu tiên, giữ flow review gọn và tránh để team nhỏ bị nghẽn khi rollout nhiều hạng mục cùng lúc.",
    tags: ["#founder", "#product", "#execution"],
    comments: [
      {
        id: 201,
        author: "Gia Linh",
        initials: "GL",
        role: "People Ops",
        message: "Phần nói về cadence weekly review khá sát với thực tế team nhỏ.",
        time: "6 phút trước",
      },
      {
        id: 202,
        author: "Phúc An",
        initials: "PA",
        role: "Founder",
        message: "Mong anh nói thêm về cách cắt bớt scope khi deadline bị chèn.",
        time: "2 phút trước",
      },
    ],
  },
  {
    id: "watch-education-workshop",
    title: "Workshop học tập: tối ưu cách ghi chú để nhớ lâu hơn",
    category: "education",
    categoryLabel: "Giáo dục",
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "from-amber-500 to-primary-500",
    date: "Hôm nay",
    duration: "32:05",
    views: 860,
    likes: 64,
    shares: 9,
    cover: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
    description: "Một buổi chia sẻ tập trung vào note-taking, ôn tập theo cụm chủ đề và cách giữ được nhịp học đều mà không quá tải.",
    tags: ["#education", "#learning", "#notes"],
    comments: [
      {
        id: 301,
        author: "Thảo Vy",
        initials: "TV",
        role: "Content Lead",
        message: "Ví dụ về Cornell notes khá dễ áp dụng luôn.",
        time: "14 phút trước",
      },
      {
        id: 302,
        author: "Kim Ngân",
        initials: "KN",
        role: "Mentor",
        message: "Nếu có template note mẫu thì buổi này sẽ càng trọn vẹn hơn.",
        time: "9 phút trước",
      },
    ],
  },
  {
    id: "watch-tech-review",
    title: "Live review công nghệ tuần này",
    category: "technology",
    categoryLabel: "Công nghệ",
    author: "Đức Minh",
    authorInitials: "DM",
    authorGradient: "from-slate-700 to-blue-500",
    date: "1 giờ trước",
    duration: "15:27",
    views: 2240,
    likes: 152,
    shares: 27,
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    description: "Đi nhanh qua các cập nhật đáng chú ý trong hệ sinh thái frontend, công cụ AI hỗ trợ code và những thay đổi mới đáng thử.",
    tags: ["#tech", "#frontend", "#ai"],
    comments: [
      {
        id: 401,
        author: "Bảo Trâm",
        initials: "BT",
        role: "Frontend Engineer",
        message: "Đoạn so sánh giữa tool cũ và mới khá dễ hình dung.",
        time: "18 phút trước",
      },
      {
        id: 402,
        author: "Anh Thư",
        initials: "AT",
        role: "Designer",
        message: "Cho xin lại link repo demo ở cuối buổi nhé.",
        time: "12 phút trước",
      },
    ],
  },
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const isWatchCategoryOption = (value: unknown): value is WatchCategoryOption =>
  isRecord(value)
  && typeof value.label === "string"
  && typeof value.value === "string"
  && typeof value.icon === "string"

const isWatchVideo = (value: unknown): value is WatchVideo =>
  isRecord(value)
  && typeof value.id === "string"
  && typeof value.title === "string"
  && typeof value.category === "string"
  && typeof value.categoryLabel === "string"
  && typeof value.author === "string"
  && typeof value.authorInitials === "string"
  && typeof value.authorGradient === "string"
  && typeof value.date === "string"
  && typeof value.duration === "string"
  && typeof value.views === "number"
  && typeof value.likes === "number"
  && typeof value.shares === "number"
  && typeof value.cover === "string"
  && typeof value.description === "string"
  && Array.isArray(value.tags)
  && Array.isArray(value.comments)

export const useMockWatchData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed<WatchCategoryOption[]>(() => {
    const value = localized<unknown>("pages.watchPage.categories")
    return Array.isArray(value) && value.every(isWatchCategoryOption)
      ? value
      : defaultWatchCategories
  })

  const videos = computed<WatchVideo[]>(() => {
    const value = localized<unknown>("pages.watchPage.videos")
    return Array.isArray(value) && value.every(isWatchVideo)
      ? value
      : defaultWatchVideos
  })

  return {
    categories,
    videos,
    findVideoById: (id: string) => videos.value.find(video => video.id === id),
  }
}

export const formatWatchNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
