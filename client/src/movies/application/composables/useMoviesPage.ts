import { formatMovieNumber, movieMatchesKeyword } from "../../domain/services/movies-format.service"
import type { MovieCategoryKey, MovieItem } from "../../domain/types/movies.types"
import { useMoviesDataSource } from "../../infrastructure/adapters/moviesData.adapter"

export function useMoviesPage() {
  const { categories, movies, collections, upcoming } = useMoviesDataSource()
  const { t: translate, locale } = useI18n()

  const search = ref("")
  const selectedCategory = ref<MovieCategoryKey>("all")
  const activeMovieId = ref(movies.value[0]?.id ?? "")

  const categoryLabelMap = computed(() =>
    Object.fromEntries(
      categories.value.map(category => [category.value, category.label]),
    ) as Record<MovieCategoryKey, string>,
  )

  const filteredMovies = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return movies.value.filter((movie) => {
      const matchesCategory = selectedCategory.value === "all" || movie.category === selectedCategory.value
      const matchesKeyword = movieMatchesKeyword(movie, keyword, categoryLabelMap.value[movie.category])

      return matchesCategory && matchesKeyword
    })
  })

  watch(filteredMovies, (items) => {
    if (!items.some(movie => movie.id === activeMovieId.value)) {
      activeMovieId.value = items[0]?.id ?? movies.value[0]?.id ?? ""
    }
  })

  const activeMovie = computed<MovieItem>(() =>
    filteredMovies.value.find(movie => movie.id === activeMovieId.value)
    ?? movies.value.find(movie => movie.id === activeMovieId.value)
    ?? movies.value[0]!,
  )

  const topRatedMovies = computed(() =>
    movies.value
      .slice()
      .sort((left, right) => right.rating - left.rating)
      .slice(0, 4),
  )

  const totalRuntimeHours = computed(() =>
    Math.round(movies.value.reduce((sum, movie) => sum + movie.runtimeMinutes, 0) / 60),
  )

  const heroStats = computed(() => [
    {
      label: translate("pages.moviesPage.statTitles"),
      value: movies.value.length,
      description: translate("pages.moviesPage.statTitlesDescription"),
    },
    {
      label: translate("pages.moviesPage.statViews"),
      value: formatMovieNumber(284600, locale.value),
      description: translate("pages.moviesPage.statViewsDescription"),
    },
    {
      label: translate("pages.moviesPage.statHours"),
      value: `${totalRuntimeHours.value}h`,
      description: translate("pages.moviesPage.statHoursDescription"),
    },
  ])

  const resultHeading = computed(() => {
    if (selectedCategory.value === "all") return translate("pages.moviesPage.resultHeadingAll")
    return translate("pages.moviesPage.resultHeadingCategory", { label: categoryLabelMap.value[selectedCategory.value] })
  })

  const primaryActionLabel = computed(() =>
    activeMovie.value.isPremiere ? translate("pages.moviesPage.primaryActionPremiere") : translate("pages.moviesPage.primaryActionDefault"),
  )

  const secondaryActionLabel = computed(() =>
    activeMovie.value.isEditorsPick ? translate("pages.moviesPage.secondaryActionEditorsPick") : translate("pages.moviesPage.secondaryActionDefault"),
  )

  const resetFilters = () => {
    search.value = ""
    selectedCategory.value = "all"
    activeMovieId.value = movies.value[0]?.id ?? ""
  }

  return {
    activeMovie,
    activeMovieId,
    categories,
    categoryLabelMap,
    collections,
    filteredMovies,
    heroStats,
    primaryActionLabel,
    resultHeading,
    search,
    secondaryActionLabel,
    selectedCategory,
    topRatedMovies,
    upcoming,
    resetFilters,
  }
}
