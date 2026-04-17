<template>
  <div class="space-y-5 pb-10">
    <BlogsHero
      :article-count="articles.length"
      :mine-only="mineOnly"
      :stats="heroStats"
      @toggle-mine="mineOnly = !mineOnly"
    />

    <BlogsFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      v-model:sort-by="sortBy"
      v-model:mine-only="mineOnly"
      :categories="categoryOptions"
      :sort-options="sortOptions"
      :article-count="filteredArticles.length"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section class="space-y-4">
        <BlogsResultsHeader
          :heading="resultHeading"
          :count="filteredArticles.length"
          :sort-label="currentSortLabel"
          @reset="resetFilters"
        />

        <div v-if="pageArticles.length > 0" class="grid gap-4 md:grid-cols-2">
          <BlogsBlogArticleCard
            v-for="article in pageArticles"
            :key="article.id"
            :article="article"
            :format-compact="formatCompact"
          />
        </div>

        <BlogsEmptyState v-else @reset="resetFilters" />

        <BlogsPagination
          v-if="filteredArticles.length > pageSize"
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :pages="visiblePageNumbers"
        />
      </section>

      <BlogsSidebar
        :trending-topics="trendingTopics"
        :featured-authors="featuredAuthors"
        @select-category="selectCategory"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type BlogCategory =
  | "all"
  | "vehicles"
  | "business"
  | "education"
  | "movies"
  | "gaming"
  | "history"
  | "lifestyle"
  | "pets"
  | "science"
  | "sports"
  | "travel"
  | "people"
  | "other"

type SortValue = "latest" | "popular" | "views" | "reading"

type BlogArticle = {
  id: number
  title: string
  excerpt: string
  category: Exclude<BlogCategory, "all">
  categoryLabel: string
  author: string
  authorInitials: string
  authorGradient: string
  publishedAt: string
  publishedHoursAgo: number
  views: number
  readMinutes: number
  likes: number
  tags: string[]
  image: string
  imageFallback: string
  href: string
  mine?: boolean
}

useSeoMeta({
  title: "Blogs | VNSEEA",
  description: "Danh sách bài báo mới, chủ đề nổi bật và các bài viết cộng đồng trên VNSEEA.",
})

const route = useRoute()

const search = ref("")
const selectedCategory = ref<BlogCategory>("all")
const sortBy = ref<SortValue>("latest")
const currentPage = ref(1)
const mineOnly = ref(route.query.mine === "1")
const pageSize = 6

watch(() => route.query.mine, (value) => {
  mineOnly.value = value === "1"
})

watch([search, selectedCategory, sortBy, mineOnly], () => {
  currentPage.value = 1
})

const categoryOptions = [
  { label: "Tất cả", value: "all", icon: "i-ph-squares-four-fill" },
  { label: "Ô tô và Xe cộ", value: "vehicles", icon: "i-ph-car-profile" },
  { label: "Kinh tế và Thương mại", value: "business", icon: "i-ph-trend-up" },
  { label: "Giáo dục", value: "education", icon: "i-ph-graduation-cap" },
  { label: "Phim & Hoạt hình", value: "movies", icon: "i-ph-film-slate" },
  { label: "Chơi game", value: "gaming", icon: "i-ph-game-controller" },
  { label: "Lịch sử và Sự kiện", value: "history", icon: "i-ph-landmark" },
  { label: "Cách sống", value: "lifestyle", icon: "i-ph-house-line" },
  { label: "Thú cưng và Động vật", value: "pets", icon: "i-ph-paw-print" },
  { label: "Khoa học và Công nghệ", value: "science", icon: "i-ph-microscope" },
  { label: "Thể thao", value: "sports", icon: "i-ph-soccer-ball" },
  { label: "Du lịch và Sự kiện", value: "travel", icon: "i-ph-airplane-tilt" },
  { label: "Con người và Quốc gia", value: "people", icon: "i-ph-globe-hemisphere-east" },
  { label: "Khác", value: "other", icon: "i-ph-dots-three-circle" },
] satisfies { label: string; value: BlogCategory; icon: string }[]

const sortOptions = [
  { label: "Mới nhất", value: "latest" },
  { label: "Được quan tâm", value: "popular" },
  { label: "Nhiều lượt xem", value: "views" },
  { label: "Đọc nhanh", value: "reading" },
] satisfies { label: string; value: SortValue }[]

const articles = [
  {
    id: 1,
    title: "Recycled Plastic Granules Market Growth Accelerates with Global Sustainability Initiatives",
    excerpt: "Các doanh nghiệp tái chế đang mở rộng chuỗi cung ứng nhựa hạt, tập trung vào tiêu chuẩn xanh và hợp đồng dài hạn.",
    category: "business",
    categoryLabel: "Kinh tế và Thương mại",
    author: "Justin",
    authorInitials: "JT",
    authorGradient: "linear-gradient(135deg,#0000ff 0%,#4f7cff 100%)",
    publishedAt: "15 phút trước",
    publishedHoursAgo: 0.25,
    views: 18400,
    readMinutes: 5,
    likes: 412,
    tags: ["market", "recycle"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#16a34a 46%,#bbf7d0 100%)",
    href: "/read-blog/recycled-plastic-granules-market-growth",
    mine: true,
  },
  {
    id: 2,
    title: "Passion Hose: Your Trusted Gas Hose Manufacturer for Industrial and Automotive Needs",
    excerpt: "Một góc nhìn về tiêu chuẩn an toàn, kiểm định vật liệu và cách doanh nghiệp lựa chọn nhà sản xuất ống dẫn khí.",
    category: "vehicles",
    categoryLabel: "Ô tô và Xe cộ",
    author: "Hoangne",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#334155 0%,#0f172a 100%)",
    publishedAt: "42 phút trước",
    publishedHoursAgo: 0.7,
    views: 12600,
    readMinutes: 4,
    likes: 286,
    tags: ["industry", "auto"],
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#172554 0%,#1d4ed8 46%,#7dd3fc 100%)",
    href: "/read-blog/passion-hose-industrial-automotive-needs",
  },
  {
    id: 3,
    title: "Lớp học số sau giờ làm: cách người trẻ nâng kỹ năng mỗi tuần",
    excerpt: "Những khóa học ngắn, nhóm học nhỏ và tài liệu mở giúp người đi làm duy trì nhịp học tập bền hơn.",
    category: "education",
    categoryLabel: "Giáo dục",
    author: "Dung 1",
    authorInitials: "D1",
    authorGradient: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
    publishedAt: "1 giờ trước",
    publishedHoursAgo: 1,
    views: 9300,
    readMinutes: 6,
    likes: 204,
    tags: ["learning", "career"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#4338ca 0%,#06b6d4 100%)",
    href: "/read-blog/lop-hoc-so-sau-gio-lam",
  },
  {
    id: 4,
    title: "Không gian sống tối giản cho căn hộ nhỏ",
    excerpt: "Một số lựa chọn ánh sáng, lưu trữ và màu sắc giúp căn hộ nhỏ gọn gàng nhưng vẫn có cá tính riêng.",
    category: "lifestyle",
    categoryLabel: "Cách sống",
    author: "Ngoctokyo",
    authorInitials: "NT",
    authorGradient: "linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)",
    publishedAt: "3 giờ trước",
    publishedHoursAgo: 3,
    views: 7600,
    readMinutes: 3,
    likes: 176,
    tags: ["home", "minimal"],
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0f766e 0%,#99f6e4 100%)",
    href: "/read-blog/khong-gian-song-toi-gian",
  },
  {
    id: 5,
    title: "Bản tin công nghệ: AI cá nhân hóa luồng đọc tin",
    excerpt: "Các hệ thống gợi ý mới ưu tiên ngữ cảnh, sở thích và lịch sử tương tác thay vì chỉ dựa trên lượt xem.",
    category: "science",
    categoryLabel: "Khoa học và Công nghệ",
    author: "Nicolas",
    authorInitials: "NC",
    authorGradient: "linear-gradient(135deg,#1e293b 0%,#4f46e5 100%)",
    publishedAt: "4 giờ trước",
    publishedHoursAgo: 4,
    views: 15400,
    readMinutes: 5,
    likes: 520,
    tags: ["ai", "news"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#111827 0%,#4f46e5 42%,#c4b5fd 100%)",
    href: "/read-blog/ai-ca-nhan-hoa-luong-doc-tin",
  },
  {
    id: 6,
    title: "Những cung đường cuối tuần gần biển",
    excerpt: "Gợi ý các điểm dừng dễ đi, lịch trình ngắn và cách chuẩn bị để chuyến đi nhẹ nhàng hơn.",
    category: "travel",
    categoryLabel: "Du lịch và Sự kiện",
    author: "Minh Anh",
    authorInitials: "MA",
    authorGradient: "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
    publishedAt: "5 giờ trước",
    publishedHoursAgo: 5,
    views: 6900,
    readMinutes: 4,
    likes: 149,
    tags: ["travel", "weekend"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0369a1 0%,#7dd3fc 100%)",
    href: "/read-blog/cung-duong-cuoi-tuan-gan-bien",
  },
  {
    id: 7,
    title: "Đội bóng phong trào và cách giữ lịch tập đều",
    excerpt: "Quản lý sân bãi, chia vai trò và theo dõi thể lực giúp các đội nghiệp dư giữ nhịp thi đấu ổn định.",
    category: "sports",
    categoryLabel: "Thể thao",
    author: "Thanh Sơn",
    authorInitials: "TS",
    authorGradient: "linear-gradient(135deg,#15803d 0%,#22c55e 100%)",
    publishedAt: "6 giờ trước",
    publishedHoursAgo: 6,
    views: 5300,
    readMinutes: 4,
    likes: 118,
    tags: ["football", "team"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#14532d 0%,#22c55e 100%)",
    href: "/read-blog/doi-bong-phong-trao-lich-tap-deu",
  },
  {
    id: 8,
    title: "Game indie Việt và những nhóm phát triển nhỏ",
    excerpt: "Từ prototype cuối tuần đến bản phát hành đầu tiên, các nhóm nhỏ đang tìm cách kể câu chuyện rất riêng.",
    category: "gaming",
    categoryLabel: "Chơi game",
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#4338ca 0%,#a855f7 100%)",
    publishedAt: "Hôm qua",
    publishedHoursAgo: 24,
    views: 8800,
    readMinutes: 5,
    likes: 268,
    tags: ["game", "indie"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#312e81 0%,#a855f7 100%)",
    href: "/read-blog/game-indie-viet-nhom-phat-trien-nho",
    mine: true,
  },
] satisfies BlogArticle[]

const heroStats = computed(() => [
  {
    label: "Bài mới hôm nay",
    value: String(articles.filter(article => article.publishedHoursAgo <= 12).length),
    description: "Các bài đã được cập nhật trong ngày.",
  },
  {
    label: "Chủ đề",
    value: String(categoryOptions.length - 1),
    description: "Danh mục theo luồng nội dung hiện có.",
  },
  {
    label: "Của tôi",
    value: String(articles.filter(article => article.mine).length),
    description: "Bài báo bạn có thể lọc nhanh.",
  },
])

const currentSortLabel = computed(
  () => sortOptions.find(option => option.value === sortBy.value)?.label ?? "Mới nhất",
)

const resultHeading = computed(() => {
  if (mineOnly.value) return "Bài báo của tôi"
  if (selectedCategory.value === "all") return "Danh sách bài báo đang được quan tâm"
  return categoryOptions.find(category => category.value === selectedCategory.value)?.label ?? "Danh sách bài báo"
})

const filteredArticles = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filtered = articles.filter((article) => {
    const matchesKeyword = keyword.length === 0 || [
      article.title,
      article.excerpt,
      article.categoryLabel,
      article.author,
      ...article.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory =
      selectedCategory.value === "all" || article.category === selectedCategory.value

    const matchesMine = !mineOnly.value || article.mine

    return matchesKeyword && matchesCategory && matchesMine
  })

  return filtered.slice().sort((left, right) => {
    switch (sortBy.value) {
      case "popular":
        return right.likes - left.likes || right.views - left.views
      case "views":
        return right.views - left.views
      case "reading":
        return left.readMinutes - right.readMinutes
      case "latest":
      default:
        return left.publishedHoursAgo - right.publishedHoursAgo
    }
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / pageSize)))

const pageArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const visiblePageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)

const trendingTopics = computed(() =>
  categoryOptions
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: articles.filter(article => article.category === category.value).length,
    }))
    .filter(topic => topic.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, "vi"))
    .slice(0, 6),
)

const featuredAuthors = computed(() =>
  articles
    .slice()
    .sort((left, right) => right.likes - left.likes)
    .slice(0, 4)
    .map(article => ({
      name: article.author,
      initials: article.authorInitials,
      gradient: article.authorGradient,
      count: articles.filter(item => item.author === article.author).length,
      topic: article.categoryLabel,
    })),
)

const compactFormatter = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const formatCompact = (value: number) => compactFormatter.format(value)

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  sortBy.value = "latest"
  mineOnly.value = false
  currentPage.value = 1
}

const selectCategory = (value: string) => {
  selectedCategory.value = value as BlogCategory
}
</script>
