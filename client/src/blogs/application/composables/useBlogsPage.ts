import { computed, ref, watch } from "vue"
import type { BlogCategory, BlogOption, BlogSortValue } from "../../domain/types/blog.types"
import {
  buildBlogsQuery,
  createFeaturedAuthors,
  createTrendingTopics,
  createVisiblePageNumbers,
  filterBlogArticles,
  hasSameBlogsQuery,
  paginateBlogArticles,
  resolveBlogCategoryQuery,
  resolveBlogMineQuery,
  resolveBlogPageQuery,
  resolveBlogSearchQuery,
  resolveBlogSortQuery,
  type BlogQueryValue,
} from "../../domain/services/blog-query.service"
import { useMockBlogArticles } from "../../infrastructure/mocks/blogArticles.mock"

export function useBlogsPage() {
  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const { articles } = useMockBlogArticles()

  const search = ref(resolveBlogSearchQuery(route.query.search as BlogQueryValue))
  const selectedCategory = ref<BlogCategory>(resolveBlogCategoryQuery(route.query.category as BlogQueryValue))
  const sortBy = ref<BlogSortValue>(resolveBlogSortQuery(route.query.sort as BlogQueryValue))
  const currentPage = ref(resolveBlogPageQuery(route.query.page as BlogQueryValue))
  const mineOnly = ref(resolveBlogMineQuery(route.query.mine as BlogQueryValue))
  const pageSize = 6

  const categoryOptions = computed<Array<BlogOption<BlogCategory> & { icon: string }>>(() => [
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
  ])

  const sortOptions = computed<BlogOption<BlogSortValue>[]>(() => [
    { label: t("pages.blogsPage.sortLatest"), value: "latest" },
    { label: t("pages.blogsPage.sortPopular"), value: "popular" },
    { label: t("pages.blogsPage.sortViews"), value: "views" },
    { label: t("pages.blogsPage.sortReading"), value: "reading" },
  ])

  watch(() => route.query, (query) => {
    const nextSearch = resolveBlogSearchQuery(query.search as BlogQueryValue)
    const nextCategory = resolveBlogCategoryQuery(query.category as BlogQueryValue)
    const nextSort = resolveBlogSortQuery(query.sort as BlogQueryValue)
    const nextMineOnly = resolveBlogMineQuery(query.mine as BlogQueryValue)
    const nextPage = resolveBlogPageQuery(query.page as BlogQueryValue)

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

  const filteredArticles = computed(() =>
    filterBlogArticles(articles.value, {
      search: search.value,
      selectedCategory: selectedCategory.value,
      sortBy: sortBy.value,
      mineOnly: mineOnly.value,
    }),
  )

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

    if (hasSameBlogsQuery(nextQuery, route.query as Record<string, BlogQueryValue>)) {
      return
    }

    await router.replace({ query: nextQuery })
  }, { flush: "post" })

  const pageArticles = computed(() =>
    paginateBlogArticles(filteredArticles.value, currentPage.value, pageSize),
  )

  const visiblePageNumbers = computed(() => createVisiblePageNumbers(totalPages.value))

  const trendingTopics = computed(() =>
    createTrendingTopics(categoryOptions.value, articles.value, locale.value === "vi" ? "vi" : "en"),
  )

  const featuredAuthors = computed(() => createFeaturedAuthors(articles.value))

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

  return {
    articles,
    search,
    selectedCategory,
    sortBy,
    currentPage,
    mineOnly,
    pageSize,
    categoryOptions,
    sortOptions,
    heroStats,
    currentSortLabel,
    resultHeading,
    filteredArticles,
    totalPages,
    pageArticles,
    visiblePageNumbers,
    trendingTopics,
    featuredAuthors,
    formatCompact,
    resetFilters,
    selectCategory,
  }
}
