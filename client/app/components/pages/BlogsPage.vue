<template>
  <div class="mx-auto max-w-[1440px] space-y-5 px-3 pb-10 sm:px-5 lg:px-6">
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

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const blogCategoryValues = new Set<BlogCategory>([
  "all",
  "vehicles",
  "business",
  "education",
  "movies",
  "gaming",
  "history",
  "lifestyle",
  "pets",
  "science",
  "sports",
  "travel",
  "people",
  "other",
])

const blogSortValues = new Set<SortValue>(["latest", "popular", "views", "reading"])
const blogQueryKeys = ["search", "category", "sort", "mine", "page"] as const

type BlogsRouteQuery = Partial<Record<(typeof blogQueryKeys)[number], string>>

const getQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "")

const resolveSearchQuery = (value: string | string[] | undefined) => getQueryValue(value).trim()

const resolveCategoryQuery = (value: string | string[] | undefined): BlogCategory => {
  const normalized = getQueryValue(value)
  return blogCategoryValues.has(normalized as BlogCategory) ? normalized as BlogCategory : "all"
}

const resolveSortQuery = (value: string | string[] | undefined): SortValue => {
  const normalized = getQueryValue(value)
  return blogSortValues.has(normalized as SortValue) ? normalized as SortValue : "latest"
}

const resolveMineQuery = (value: string | string[] | undefined) => getQueryValue(value) === "1"

const resolvePageQuery = (value: string | string[] | undefined) => {
  const parsed = Number.parseInt(getQueryValue(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

const buildBlogsQuery = (state: {
  search: string
  selectedCategory: BlogCategory
  sortBy: SortValue
  mineOnly: boolean
  currentPage: number
}): BlogsRouteQuery => {
  const nextQuery: BlogsRouteQuery = {}
  const normalizedSearch = state.search.trim()

  if (normalizedSearch) {
    nextQuery.search = normalizedSearch
  }

  if (state.selectedCategory !== "all") {
    nextQuery.category = state.selectedCategory
  }

  if (state.sortBy !== "latest") {
    nextQuery.sort = state.sortBy
  }

  if (state.mineOnly) {
    nextQuery.mine = "1"
  }

  if (state.currentPage > 1) {
    nextQuery.page = String(state.currentPage)
  }

  return nextQuery
}

const hasSameBlogsQuery = (
  nextQuery: BlogsRouteQuery,
  currentQuery: ReturnType<typeof useRoute>["query"],
) => blogQueryKeys.every(key => (nextQuery[key] ?? "") === getQueryValue(currentQuery[key]))

const search = ref(resolveSearchQuery(route.query.search))
const selectedCategory = ref<BlogCategory>(resolveCategoryQuery(route.query.category))
const sortBy = ref<SortValue>(resolveSortQuery(route.query.sort))
const currentPage = ref(resolvePageQuery(route.query.page))
const mineOnly = ref(resolveMineQuery(route.query.mine))
const pageSize = 6

watch(() => route.query, (query) => {
  const nextSearch = resolveSearchQuery(query.search)
  const nextCategory = resolveCategoryQuery(query.category)
  const nextSort = resolveSortQuery(query.sort)
  const nextMineOnly = resolveMineQuery(query.mine)
  const nextPage = resolvePageQuery(query.page)

  if (search.value !== nextSearch) {
    search.value = nextSearch
  }

  if (selectedCategory.value !== nextCategory) {
    selectedCategory.value = nextCategory
  }

  if (sortBy.value !== nextSort) {
    sortBy.value = nextSort
  }

  if (mineOnly.value !== nextMineOnly) {
    mineOnly.value = nextMineOnly
  }

  if (currentPage.value !== nextPage) {
    currentPage.value = nextPage
  }
}, { immediate: true })

watch([search, selectedCategory, sortBy, mineOnly], () => {
  currentPage.value = 1
})

const categoryOptions = computed(() => [
  { label: t("pages.blogsPage.categoryAll"), value: "all", icon: "i-ph-squares-four-fill" },
  { label: t("pages.blogsPage.categoryVehicles"), value: "vehicles", icon: "i-ph-car-profile" },
  { label: t("pages.blogsPage.categoryBusiness"), value: "business", icon: "i-ph-trend-up" },
  { label: t("pages.blogsPage.categoryEducation"), value: "education", icon: "i-ph-graduation-cap" },
  { label: t("pages.blogsPage.categoryMovies"), value: "movies", icon: "i-ph-film-slate" },
  { label: t("pages.blogsPage.categoryGaming"), value: "gaming", icon: "i-ph-game-controller" },
  { label: t("pages.blogsPage.categoryHistory"), value: "history", icon: "i-ph-landmark" },
  { label: t("pages.blogsPage.categoryLifestyle"), value: "lifestyle", icon: "i-ph-house-line" },
  { label: t("pages.blogsPage.categoryPets"), value: "pets", icon: "i-ph-paw-print" },
  { label: t("pages.blogsPage.categoryScience"), value: "science", icon: "i-ph-microscope" },
  { label: t("pages.blogsPage.categorySports"), value: "sports", icon: "i-ph-soccer-ball" },
  { label: t("pages.blogsPage.categoryTravel"), value: "travel", icon: "i-ph-airplane-tilt" },
  { label: t("pages.blogsPage.categoryPeople"), value: "people", icon: "i-ph-globe-hemisphere-east" },
  { label: t("pages.blogsPage.categoryOther"), value: "other", icon: "i-ph-dots-three-circle" },
] satisfies { label: string; value: BlogCategory; icon: string }[])

const sortOptions = computed(() => [
  { label: t("pages.blogsPage.sortLatest"), value: "latest" },
  { label: t("pages.blogsPage.sortPopular"), value: "popular" },
  { label: t("pages.blogsPage.sortViews"), value: "views" },
  { label: t("pages.blogsPage.sortReading"), value: "reading" },
] satisfies { label: string; value: SortValue }[])

const articles = computed(() => [
  {
    id: 1,
    title: t("pages.blogsPage.article1Title"),
    excerpt: t("pages.blogsPage.article1Excerpt"),
    category: "business",
    categoryLabel: t("pages.blogsPage.categoryBusiness"),
    author: "Justin",
    authorInitials: "JT",
    authorGradient: "linear-gradient(135deg,#0000ff 0%,#4f7cff 100%)",
    publishedAt: t("pages.blogsPage.article1PublishedAt"),
    publishedHoursAgo: 0.25,
    views: 18400,
    readMinutes: 5,
    likes: 412,
    tags: ["market", "recycle"],
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 46%,#bfdbfe 100%)",
    href: "/read-blog/recycled-plastic-granules-market-growth",
    mine: true,
  },
  {
    id: 2,
    title: t("pages.blogsPage.article2Title"),
    excerpt: t("pages.blogsPage.article2Excerpt"),
    category: "vehicles",
    categoryLabel: t("pages.blogsPage.categoryVehicles"),
    author: "Hoangne",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#334155 0%,#0f172a 100%)",
    publishedAt: t("pages.blogsPage.article2PublishedAt"),
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
    title: t("pages.blogsPage.article3Title"),
    excerpt: t("pages.blogsPage.article3Excerpt"),
    category: "education",
    categoryLabel: t("pages.blogsPage.categoryEducation"),
    author: "Dung 1",
    authorInitials: "D1",
    authorGradient: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
    publishedAt: t("pages.blogsPage.article3PublishedAt"),
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
    title: t("pages.blogsPage.article4Title"),
    excerpt: t("pages.blogsPage.article4Excerpt"),
    category: "lifestyle",
    categoryLabel: t("pages.blogsPage.categoryLifestyle"),
    author: "Ngoctokyo",
    authorInitials: "NT",
    authorGradient: "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
    publishedAt: t("pages.blogsPage.article4PublishedAt"),
    publishedHoursAgo: 3,
    views: 7600,
    readMinutes: 3,
    likes: 176,
    tags: ["home", "minimal"],
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#0369a1 0%,#bae6fd 100%)",
    href: "/read-blog/khong-gian-song-toi-gian",
  },
  {
    id: 5,
    title: t("pages.blogsPage.article5Title"),
    excerpt: t("pages.blogsPage.article5Excerpt"),
    category: "science",
    categoryLabel: t("pages.blogsPage.categoryScience"),
    author: "Nicolas",
    authorInitials: "NC",
    authorGradient: "linear-gradient(135deg,#1e293b 0%,#4f46e5 100%)",
    publishedAt: t("pages.blogsPage.article5PublishedAt"),
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
    title: t("pages.blogsPage.article6Title"),
    excerpt: t("pages.blogsPage.article6Excerpt"),
    category: "travel",
    categoryLabel: t("pages.blogsPage.categoryTravel"),
    author: "Minh Anh",
    authorInitials: "MA",
    authorGradient: "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
    publishedAt: t("pages.blogsPage.article6PublishedAt"),
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
    title: t("pages.blogsPage.article7Title"),
    excerpt: t("pages.blogsPage.article7Excerpt"),
    category: "sports",
    categoryLabel: t("pages.blogsPage.categorySports"),
    author: "Thanh Sơn",
    authorInitials: "TS",
    authorGradient: "linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)",
    publishedAt: t("pages.blogsPage.article7PublishedAt"),
    publishedHoursAgo: 6,
    views: 5300,
    readMinutes: 4,
    likes: 118,
    tags: ["football", "team"],
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    imageFallback: "linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%)",
    href: "/read-blog/doi-bong-phong-trao-lich-tap-deu",
  },
  {
    id: 8,
    title: t("pages.blogsPage.article8Title"),
    excerpt: t("pages.blogsPage.article8Excerpt"),
    category: "gaming",
    categoryLabel: t("pages.blogsPage.categoryGaming"),
    author: "Hải Nam",
    authorInitials: "HN",
    authorGradient: "linear-gradient(135deg,#4338ca 0%,#a855f7 100%)",
    publishedAt: t("pages.blogsPage.article8PublishedAt"),
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
] satisfies BlogArticle[])

const heroStats = computed(() => [
  {
    label: t("pages.blogsPage.statNewToday"),
    value: String(articles.value.filter(article => article.publishedHoursAgo <= 12).length),
    description: t("pages.blogsPage.statNewTodayDescription"),
  },
  {
    label: t("pages.blogsPage.statTopics"),
    value: String(categoryOptions.value.length - 1),
    description: t("pages.blogsPage.statTopicsDescription"),
  },
  {
    label: t("pages.blogsPage.statMine"),
    value: String(articles.value.filter(article => article.mine).length),
    description: t("pages.blogsPage.statMineDescription"),
  },
])

const currentSortLabel = computed(
  () => sortOptions.value.find(option => option.value === sortBy.value)?.label ?? t("pages.blogsPage.sortLatest"),
)

const resultHeading = computed(() => {
  if (mineOnly.value) return t("pages.blogsPage.resultHeadingMine")
  if (selectedCategory.value === "all") return t("pages.blogsPage.resultHeadingAll")
  return categoryOptions.value.find(category => category.value === selectedCategory.value)?.label ?? t("pages.blogsPage.resultHeadingFallback")
})

const filteredArticles = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  const filtered = articles.value.filter((article) => {
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

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
})

watch([search, selectedCategory, sortBy, mineOnly, currentPage], async () => {
  if (import.meta.server) {
    return
  }

  const nextQuery = buildBlogsQuery({
    search: search.value,
    selectedCategory: selectedCategory.value,
    sortBy: sortBy.value,
    mineOnly: mineOnly.value,
    currentPage: currentPage.value,
  })

  if (hasSameBlogsQuery(nextQuery, route.query)) {
    return
  }

  await router.replace({ query: nextQuery })
}, { flush: "post" })

const pageArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const visiblePageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
)

const trendingTopics = computed(() =>
  categoryOptions.value
    .filter(category => category.value !== "all")
    .map(category => ({
      ...category,
      count: articles.value.filter(article => article.category === category.value).length,
    }))
    .filter(topic => topic.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale.value === "vi" ? "vi" : "en"))
    .slice(0, 6),
)

const featuredAuthors = computed(() =>
  articles.value
    .slice()
    .sort((left, right) => right.likes - left.likes)
    .slice(0, 4)
    .map(article => ({
      name: article.author,
      initials: article.authorInitials,
      gradient: article.authorGradient,
      count: articles.value.filter(item => item.author === article.author).length,
      topic: article.categoryLabel,
    })),
)

const compactFormatter = computed(() => new Intl.NumberFormat(locale.value === "vi" ? "vi-VN" : "en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
}))

const formatCompact = (value: number) => compactFormatter.value.format(value)

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
