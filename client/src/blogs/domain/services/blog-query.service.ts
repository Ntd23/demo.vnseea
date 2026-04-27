import type {
  BlogArticle,
  BlogCategory,
  BlogCategoryValue,
  BlogOption,
  BlogSortValue,
  BlogTopic,
  FeaturedBlogAuthor,
  ReadBlogArticle,
} from "../types/blog.types"

export const blogCategoryValues = new Set<BlogCategory>([
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

export const blogSortValues = new Set<BlogSortValue>(["latest", "popular", "views", "reading"])

export const blogQueryKeys = ["search", "category", "sort", "mine", "page"] as const

export type BlogsRouteQuery = Partial<Record<(typeof blogQueryKeys)[number], string>>

export type BlogQueryValue = string | string[] | null | undefined

export function readBlogQueryValue(value: BlogQueryValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}

export function resolveBlogSearchQuery(value: BlogQueryValue) {
  return readBlogQueryValue(value).trim()
}

export function resolveBlogCategoryQuery(value: BlogQueryValue): BlogCategory {
  const normalized = readBlogQueryValue(value)
  return blogCategoryValues.has(normalized as BlogCategory) ? normalized as BlogCategory : "all"
}

export function resolveBlogSortQuery(value: BlogQueryValue): BlogSortValue {
  const normalized = readBlogQueryValue(value)
  return blogSortValues.has(normalized as BlogSortValue) ? normalized as BlogSortValue : "latest"
}

export function resolveBlogMineQuery(value: BlogQueryValue) {
  return readBlogQueryValue(value) === "1"
}

export function resolveBlogPageQuery(value: BlogQueryValue) {
  const parsed = Number.parseInt(readBlogQueryValue(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function buildBlogsQuery(state: {
  search: string
  selectedCategory: BlogCategory
  sortBy: BlogSortValue
  mineOnly: boolean
  currentPage: number
}): BlogsRouteQuery {
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

export function hasSameBlogsQuery(
  nextQuery: BlogsRouteQuery,
  currentQuery: Record<string, BlogQueryValue>,
) {
  return blogQueryKeys.every(key => (nextQuery[key] ?? "") === readBlogQueryValue(currentQuery[key]))
}

export function filterBlogArticles(
  articles: BlogArticle[],
  state: {
    search: string
    selectedCategory: BlogCategory
    sortBy: BlogSortValue
    mineOnly: boolean
  },
) {
  const keyword = state.search.trim().toLowerCase()

  const filtered = articles.filter((article) => {
    const matchesKeyword = keyword.length === 0 || [
      article.title,
      article.excerpt,
      article.categoryLabel,
      article.author,
      ...article.tags,
    ].some(field => field.toLowerCase().includes(keyword))

    const matchesCategory =
      state.selectedCategory === "all" || article.category === state.selectedCategory

    const matchesMine = !state.mineOnly || article.mine

    return matchesKeyword && matchesCategory && matchesMine
  })

  return filtered.slice().sort((left, right) => {
    switch (state.sortBy) {
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
}

export function paginateBlogArticles(articles: BlogArticle[], currentPage: number, pageSize: number) {
  const start = (currentPage - 1) * pageSize
  return articles.slice(start, start + pageSize)
}

export function createVisiblePageNumbers(totalPages: number) {
  return Array.from({ length: totalPages }, (_, index) => index + 1)
}

export function createTrendingTopics(
  categories: ReadonlyArray<BlogOption<BlogCategory> & { icon: string }>,
  articles: BlogArticle[],
  locale: string,
): BlogTopic[] {
  return categories
    .filter((category): category is BlogOption<BlogCategoryValue> => category.value !== "all")
    .map(category => ({
      ...category,
      count: articles.filter(article => article.category === category.value).length,
    }))
    .filter(topic => topic.count > 0)
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale))
    .slice(0, 6)
}

export function createFeaturedAuthors(articles: BlogArticle[]): FeaturedBlogAuthor[] {
  return articles
    .slice()
    .sort((left, right) => right.likes - left.likes)
    .slice(0, 4)
    .map(article => ({
      name: article.author,
      initials: article.authorInitials,
      gradient: article.authorGradient,
      count: articles.filter(item => item.author === article.author).length,
      topic: article.categoryLabel,
    }))
}

export function findReadArticleBySlug(articles: ReadBlogArticle[], slug: string) {
  return articles.find(item => item.slug === slug)
}

export function readArticleExists(articles: ReadBlogArticle[], slug: string) {
  return articles.some(item => item.slug === slug)
}

export function findRelatedReadArticles(articles: ReadBlogArticle[], article: ReadBlogArticle) {
  const sameCategory = articles.filter(
    item => item.slug !== article.slug && item.categoryLabel === article.categoryLabel,
  )
  const fallback = articles.filter(item => item.slug !== article.slug)

  return (sameCategory.length > 0 ? sameCategory : fallback).slice(0, 4)
}
