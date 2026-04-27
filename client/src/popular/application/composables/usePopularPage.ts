import { createHashtagPath, createInitials, formatHashtagLabel } from "../../domain/services/popular-format.service"
import { formatPopularNumber, getPopularPostScore } from "../../domain/services/popular-score.service"
import type { PopularCategoryKey, PopularPost } from "../../domain/types/popular.types"
import { usePopularDataSource } from "../../infrastructure/adapters/popularData.adapter"

const accentPalette = [
  "linear-gradient(135deg,#2563eb 0%,#60a5fa 100%)",
  "linear-gradient(135deg,#0369a1 0%,#38bdf8 100%)",
  "linear-gradient(135deg,#7c3aed 0%,#c084fc 100%)",
  "linear-gradient(135deg,#ea580c 0%,#fb923c 100%)",
]

export function usePopularPage() {
  const { t, locale } = useI18n()
  const { categories, posts, quickLinks } = usePopularDataSource()

  const search = ref("")
  const selectedCategory = ref<PopularCategoryKey>("all")

  const filteredPosts = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return posts.value.filter((post) => {
      const matchesCategory = selectedCategory.value === "all" || post.category === selectedCategory.value
      const matchesKeyword = keyword.length === 0 || [
        post.author,
        post.role,
        post.text,
        post.trendLabel,
        ...post.tags,
      ].some(field => field.toLowerCase().includes(keyword))

      return matchesCategory && matchesKeyword
    })
  })

  const rankedPosts = computed(() =>
    filteredPosts.value
      .slice()
      .sort((left, right) => getPopularPostScore(right) - getPopularPostScore(left)),
  )

  const highestScore = computed(() =>
    rankedPosts.value.reduce((highest, post) => Math.max(highest, getPopularPostScore(post)), 0),
  )

  const categoryLabelMap = computed(() =>
    Object.fromEntries(
      categories.value.map(category => [category.value, category.label]),
    ) as Record<PopularCategoryKey, string>,
  )

  const totalInteractions = computed(() =>
    rankedPosts.value.reduce(
      (sum, post) => sum + post.stats.likes + post.stats.comments + post.stats.shares,
      0,
    ),
  )

  const totalComments = computed(() =>
    rankedPosts.value.reduce((sum, post) => sum + post.stats.comments, 0),
  )

  const uniqueCreatorsCount = computed(() =>
    new Set(rankedPosts.value.map(post => post.author)).size,
  )

  const summaryCards = computed(() => [
    {
      label: t("pages.popularPage.statPosts"),
      value: formatPopularNumber(rankedPosts.value.length, locale.value),
      description: t("pages.popularPage.statPostsDescription"),
    },
    {
      label: t("pages.popularPage.statInteractions"),
      value: formatPopularNumber(totalInteractions.value, locale.value),
      description: t("pages.popularPage.statInteractionsDescription"),
    },
    {
      label: t("pages.popularPage.statCreators"),
      value: formatPopularNumber(uniqueCreatorsCount.value, locale.value),
      description: t("pages.popularPage.statCreatorsDescription"),
    },
    {
      label: t("pages.popularPage.statComments"),
      value: formatPopularNumber(totalComments.value, locale.value),
      description: t("pages.popularPage.statCommentsDescription"),
    },
  ])

  const resultHeading = computed(() => {
    if (selectedCategory.value === "all") return t("pages.popularPage.resultHeadingAll")
    return t("pages.popularPage.resultHeadingCategory", { label: categoryLabelMap.value[selectedCategory.value] })
  })

  const topHashtags = computed(() => {
    const scoreMap = new Map<string, number>()

    rankedPosts.value.forEach((post) => {
      const postScore = getPopularPostScore(post)
      post.tags.forEach((tag) => {
        scoreMap.set(tag, (scoreMap.get(tag) ?? 0) + postScore)
      })
    })

    return Array.from(scoreMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([tag, score]) => ({
        label: formatHashtagLabel(tag),
        score: formatPopularNumber(score, locale.value),
        to: createHashtagPath(tag),
      }))
  })

  const topCreators = computed(() => {
    const creatorMap = new Map<string, { name: string; role: string; score: number }>()

    rankedPosts.value.forEach((post) => {
      const existing = creatorMap.get(post.author)
      const postScore = getPopularPostScore(post)

      if (existing) {
        existing.score += postScore
        return
      }

      creatorMap.set(post.author, {
        name: post.author,
        role: post.role,
        score: postScore,
      })
    })

    return Array.from(creatorMap.values())
      .sort((left, right) => right.score - left.score)
      .slice(0, 4)
      .map((item, index) => ({
        name: item.name,
        initials: createInitials(item.name),
        role: item.role,
        score: formatPopularNumber(item.score, locale.value),
        accent: accentPalette[index % accentPalette.length],
      }))
  })

  const formatRank = (value: number) => String(value).padStart(2, "0")

  const rankClass = (index: number) => {
    if (index === 0) return "bg-primary-600 shadow-primary-500/20"
    if (index === 1) return "bg-emerald-600 shadow-emerald-500/20"
    if (index === 2) return "bg-orange-500 shadow-orange-500/20"
    return "bg-secondary-900 shadow-secondary-900/10"
  }

  const postScorePercent = (post: Pick<PopularPost, "stats">) => {
    if (highestScore.value === 0) return 0

    return Math.max(8, Math.round((getPopularPostScore(post) / highestScore.value) * 100))
  }

  const resetFilters = () => {
    search.value = ""
    selectedCategory.value = "all"
  }

  return {
    categories,
    categoryLabelMap,
    quickLinks,
    rankedPosts,
    resultHeading,
    search,
    selectedCategory,
    summaryCards,
    topCreators,
    topHashtags,
    formatPopularNumber,
    formatRank,
    getPopularPostScore,
    postScorePercent,
    rankClass,
    resetFilters,
    locale,
  }
}
