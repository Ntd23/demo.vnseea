import { computed } from "vue"
import { resolveI18nMessage } from "#shared-kernel/application/utils/resolveI18nMessage"

export type PopularCategoryKey =
  | "all"
  | "community"
  | "product"
  | "business"
  | "design"
  | "technology"

export type PopularCategory = {
  label: string
  value: PopularCategoryKey
  icon: string
}

export type PopularComment = {
  id: number
  author: string
  role: string
  text: string
}

export type PopularPost = {
  id: string
  author: string
  role: string
  audience: string
  time: string
  text: string
  tags: string[]
  stats: {
    likes: number
    comments: number
    shares: number
  }
  media?: "double" | "single"
  comments: PopularComment[]
  category: Exclude<PopularCategoryKey, "all">
  trendLabel: string
}

export type PopularQuickLink = {
  title: string
  description: string
  to: string
  icon: string
  accent: string
}

const defaultPopularCategories: PopularCategory[] = [
  { label: "Tất cả", value: "all", icon: "i-ph-squares-four-bold" },
  { label: "Cộng đồng", value: "community", icon: "i-ph-users-three-bold" },
  { label: "Sản phẩm", value: "product", icon: "i-ph-cube-bold" },
  { label: "Kinh doanh", value: "business", icon: "i-ph-briefcase-bold" },
  { label: "Thiết kế", value: "design", icon: "i-ph-palette-bold" },
  { label: "Công nghệ", value: "technology", icon: "i-ph-cpu-bold" },
]

const defaultPopularPosts: PopularPost[] = [
  {
    id: "popular-community-1",
    author: "Thu Hà",
    role: "Community lead",
    audience: "Công khai",
    time: "12 phút trước",
    text: "Team vừa chốt lại thứ tự rollout cho các page công khai: ưu tiên route ổn định, state SSR-safe và feedback rõ ở từng action thay vì chỉ đổi UI bề mặt.",
    tags: ["migration", "community", "nuxt"],
    stats: { likes: 124, comments: 28, shares: 7 },
    media: "double",
    comments: [
      { id: 11, author: "Nam Phạm", role: "Frontend", text: "Nếu giữ được shell và route state ổn định thì các page sau sẽ vào nhanh hơn rất nhiều." },
      { id: 12, author: "Linh Đào", role: "Product", text: "Ưu tiên này hợp lý vì giảm được cảm giác app bị đơ khi điều hướng." },
    ],
    category: "community",
    trendLabel: "Đang tăng mạnh",
  },
  {
    id: "popular-product-1",
    author: "Bảo Trâm",
    role: "Marketplace curator",
    audience: "Thành viên",
    time: "35 phút trước",
    text: "Marketplace mock mới đang cho thấy card sản phẩm cần ưu tiên giá, vị trí và CTA gọn hơn. Chỉ cần thừa một tầng badge là trải nghiệm bắt đầu rối ngay.",
    tags: ["marketplace", "product", "ux"],
    stats: { likes: 96, comments: 19, shares: 5 },
    media: "single",
    comments: [
      { id: 21, author: "Quỳnh Lan", role: "Designer", text: "Đúng, phần media nên dẫn mắt vào giá và trạng thái trước rồi mới đến mô tả." },
      { id: 22, author: "Phúc An", role: "Seller", text: "CTA nhỏ gọn nhưng rõ hơn rất nhiều so với kiểu icon thả nổi." },
    ],
    category: "product",
    trendLabel: "Bàn luận nhiều",
  },
  {
    id: "popular-business-1",
    author: "Minh Quân",
    role: "Startup operator",
    audience: "Công khai",
    time: "1 giờ trước",
    text: "Nếu một route có thể crash vì data chưa sẵn, đó không chỉ là lỗi dữ liệu mà còn là lỗi contract. Page nên có fallback đủ shape để người dùng vẫn rời đi được bình thường.",
    tags: ["business", "ssr", "contract"],
    stats: { likes: 141, comments: 33, shares: 12 },
    comments: [
      { id: 31, author: "Gia Linh", role: "People Ops", text: "Đúng, không nên để toàn app mắc kẹt chỉ vì một page detail nổ runtime." },
      { id: 32, author: "Hải Nam", role: "Tech lead", text: "Guard ở composable + page fallback là cách xử lý thực dụng và bền hơn." },
    ],
    category: "business",
    trendLabel: "Lan rộng nhanh",
  },
  {
    id: "popular-design-1",
    author: "Anh Thư",
    role: "Product designer",
    audience: "Công khai",
    time: "2 giờ trước",
    text: "Popular page nên tạo cảm giác biên tập chứ không chỉ là feed sắp xếp lại. Hero, quick links và sidebar phải cho thấy đây là nơi gom những gì đáng xem nhất.",
    tags: ["design", "curation", "popular"],
    stats: { likes: 88, comments: 17, shares: 9 },
    media: "single",
    comments: [
      { id: 41, author: "Kim Ngân", role: "Content strategist", text: "Đúng, nếu visual không đổi nhịp thì người dùng khó phân biệt nó với home feed." },
      { id: 42, author: "Đức Minh", role: "Frontend engineer", text: "Sidebar creator + hashtag đang làm tốt vai trò tóm nhịp." },
    ],
    category: "design",
    trendLabel: "Được lưu nhiều",
  },
  {
    id: "popular-technology-1",
    author: "Đức Minh",
    role: "Frontend engineer",
    audience: "Thành viên",
    time: "3 giờ trước",
    text: "Khi locale thiếu hẳn namespace, route vẫn nên render bằng fallback data nội bộ thay vì đợi đến lúc người dùng tự reload mới thoát được trạng thái gãy.",
    tags: ["technology", "i18n", "runtime"],
    stats: { likes: 167, comments: 26, shares: 18 },
    comments: [
      { id: 51, author: "Bảo Trâm", role: "Frontend", text: "Fallback kiểu này giảm rất nhiều lỗi demo route trong giai đoạn migrate." },
      { id: 52, author: "Thu Hà", role: "Community lead", text: "Miễn là text thật vẫn được bổ sung lại vào locale thì ổn." },
    ],
    category: "technology",
    trendLabel: "Hot hôm nay",
  },
]

const defaultPopularQuickLinks: PopularQuickLink[] = [
  {
    title: "Xem video nổi bật",
    description: "Đi tiếp sang khu Watch để xem các phiên nội dung đang được quan tâm.",
    to: "/watch",
    icon: "i-ph-play-circle-bold",
    accent: "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  },
  {
    title: "Theo dõi live",
    description: "Mở nhanh các buổi live đang lên sóng trong cộng đồng.",
    to: "/live",
    icon: "i-ph-broadcast-bold",
    accent: "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
  },
  {
    title: "Đọc blog sâu hơn",
    description: "Chuyển sang blog để đọc các bài dài và góc nhìn đã được biên tập.",
    to: "/blogs",
    icon: "i-ph-newspaper-bold",
    accent: "linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)",
  },
  {
    title: "Khám phá thị trường",
    description: "Xem những listing sản phẩm đang được chú ý trên marketplace.",
    to: "/products",
    icon: "i-ph-storefront-bold",
    accent: "linear-gradient(135deg,#ea580c 0%,#fb923c 100%)",
  },
]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const isPopularCategory = (value: unknown): value is PopularCategory =>
  isRecord(value)
  && typeof value.label === "string"
  && typeof value.value === "string"
  && typeof value.icon === "string"

const isPopularComment = (value: unknown): value is PopularComment =>
  isRecord(value)
  && typeof value.id === "number"
  && typeof value.author === "string"
  && typeof value.role === "string"
  && typeof value.text === "string"

const isPopularPost = (value: unknown): value is PopularPost =>
  isRecord(value)
  && typeof value.id === "string"
  && typeof value.author === "string"
  && typeof value.role === "string"
  && typeof value.audience === "string"
  && typeof value.time === "string"
  && typeof value.text === "string"
  && Array.isArray(value.tags)
  && isRecord(value.stats)
  && typeof value.stats.likes === "number"
  && typeof value.stats.comments === "number"
  && typeof value.stats.shares === "number"
  && Array.isArray(value.comments)
  && value.comments.every(isPopularComment)
  && typeof value.category === "string"
  && typeof value.trendLabel === "string"

const isPopularQuickLink = (value: unknown): value is PopularQuickLink =>
  isRecord(value)
  && typeof value.title === "string"
  && typeof value.description === "string"
  && typeof value.to === "string"
  && typeof value.icon === "string"
  && typeof value.accent === "string"

export const useMockPopularData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed<PopularCategory[]>(() => {
    const value = localized<unknown>("pages.popularPage.categories")
    return Array.isArray(value) && value.every(isPopularCategory)
      ? value
      : defaultPopularCategories
  })

  const posts = computed<PopularPost[]>(() => {
    const value = localized<unknown>("pages.popularPage.posts")
    return Array.isArray(value) && value.every(isPopularPost)
      ? value
      : defaultPopularPosts
  })

  const quickLinks = computed<PopularQuickLink[]>(() => {
    const value = localized<unknown>("pages.popularPage.quickLinks")
    return Array.isArray(value) && value.every(isPopularQuickLink)
      ? value
      : defaultPopularQuickLinks
  })

  return {
    categories,
    posts,
    quickLinks,
  }
}

export const getPopularPostScore = (
  post: Pick<PopularPost, "stats">,
) => post.stats.likes + post.stats.comments * 2 + post.stats.shares * 3

export const formatPopularNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
