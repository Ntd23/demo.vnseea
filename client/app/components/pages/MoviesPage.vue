<template>
  <div class="space-y-4 pb-10 sm:space-y-5">
    <MoviesHero
      :eyebrow="t('pages.moviesPage.heroEyebrow')"
      :movie="activeMovie"
      :primary-label="primaryActionLabel"
      :secondary-label="secondaryActionLabel"
      :stats="heroStats"
    />

    <MoviesFilters
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      :placeholder="t('pages.moviesPage.searchPlaceholder')"
    />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <section class="min-w-0 space-y-4">
        <div class="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-1">
          <NuxtLink
            v-for="item in collections"
            :key="item.title"
            :to="item.to"
            class="group min-w-[216px] shrink-0 rounded-[24px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] transition hover:-translate-y-1 sm:min-w-[240px]"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-[18px] text-white" :style="{ background: item.accent }">
              <Icon :name="item.icon" class="h-5 w-5" />
            </div>
            <h3 class="mt-4 text-[1.05rem] font-black text-[var(--text-primary)]">{{ item.title }}</h3>
            <p class="mt-2 text-[13px] font-semibold leading-6 text-[var(--text-secondary)]">{{ item.description }}</p>
            <div class="mt-4 inline-flex items-center gap-2 text-[12px] font-black text-[var(--color-primary-700)]">
              {{ t("pages.moviesPage.openLink") }}
              <Icon name="i-ph-arrow-up-right-bold" class="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </NuxtLink>
        </div>

        <div class="rounded-[30px] border border-[var(--border-default)] bg-white p-4 shadow-[var(--shadow-md)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-label-secondary text-[var(--text-tertiary)]">{{ t("pages.moviesPage.resultEyebrow") }}</p>
              <h2 class="mt-1 text-heading text-[var(--text-primary)]">{{ resultHeading }}</h2>
              <p class="mt-1 text-body-secondary">{{ t("pages.moviesPage.resultCount", { count: filteredMovies.length }) }}</p>
            </div>
            <button
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-5 text-[13px] font-extrabold text-[var(--color-primary-600)] sm:w-auto"
              type="button"
              @click="resetFilters"
            >
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-4 w-4" />
              {{ t("pages.moviesPage.resetFilters") }}
            </button>
          </div>
        </div>

        <div v-if="filteredMovies.length > 0" class="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          <MoviesCard
            v-for="movie in filteredMovies"
            :key="movie.id"
            :category-label="categoryLabelMap[movie.category]"
            :director-label="t('pages.moviesPage.directorLabel')"
            :movie="movie"
            :primary-label="t('pages.moviesPage.cardPrimaryAction')"
            :secondary-label="t('pages.moviesPage.cardSecondaryAction')"
            :selected="movie.id === activeMovieId"
            @select="activeMovieId = $event"
          />
        </div>

        <div v-else class="rounded-[30px] border border-dashed border-[var(--border-default)] bg-white p-6 text-center shadow-[var(--shadow-md)] sm:p-8">
          <Icon name="i-ph-popcorn-fill" class="mx-auto h-12 w-12 text-[var(--color-primary-600)]" />
          <h3 class="mt-3 text-xl font-black text-[var(--text-primary)]">{{ t("pages.moviesPage.emptyTitle") }}</h3>
          <p class="mt-2 text-body-secondary">{{ t("pages.moviesPage.emptyDescription") }}</p>
        </div>
      </section>

      <MoviesSidebar
        :active-movie-id="activeMovieId"
        :picks="topRatedMovies"
        :picks-eyebrow="t('pages.moviesPage.sidebarPicksEyebrow')"
        :picks-title="t('pages.moviesPage.sidebarPicksTitle')"
        :upcoming="upcoming"
        :upcoming-eyebrow="t('pages.moviesPage.sidebarUpcomingEyebrow')"
        :upcoming-title="t('pages.moviesPage.sidebarUpcomingTitle')"
        @select="activeMovieId = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MovieCategoryKey, MockMovie } from "~/composables/useMockMoviesData"
import { formatMovieNumber } from "~/composables/useMockMoviesData"

const { categories, movies, collections, upcoming } = useMockMoviesData()
const { t, locale } = useI18n()

useSeoMeta({
  title: () => t("pages.moviesPage.seoTitle"),
  description: () => t("pages.moviesPage.seoDescription"),
})

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
    const matchesKeyword = keyword.length === 0 || [
      movie.title,
      movie.director,
      movie.summary,
      ...movie.tags,
      categoryLabelMap.value[movie.category],
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesCategory && matchesKeyword
  })
})

watch(filteredMovies, (items) => {
  if (!items.some(movie => movie.id === activeMovieId.value)) {
    activeMovieId.value = items[0]?.id ?? movies.value[0]?.id ?? ""
  }
})

const activeMovie = computed<MockMovie>(() =>
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
    label: t("pages.moviesPage.statTitles"),
    value: movies.value.length,
    description: t("pages.moviesPage.statTitlesDescription"),
  },
  {
    label: t("pages.moviesPage.statViews"),
    value: formatMovieNumber(284600, locale.value),
    description: t("pages.moviesPage.statViewsDescription"),
  },
  {
    label: t("pages.moviesPage.statHours"),
    value: `${totalRuntimeHours.value}h`,
    description: t("pages.moviesPage.statHoursDescription"),
  },
])

const resultHeading = computed(() => {
  if (selectedCategory.value === "all") return t("pages.moviesPage.resultHeadingAll")
  return t("pages.moviesPage.resultHeadingCategory", { label: categoryLabelMap.value[selectedCategory.value] })
})

const primaryActionLabel = computed(() =>
  activeMovie.value.isPremiere ? t("pages.moviesPage.primaryActionPremiere") : t("pages.moviesPage.primaryActionDefault"),
)

const secondaryActionLabel = computed(() =>
  activeMovie.value.isEditorsPick ? t("pages.moviesPage.secondaryActionEditorsPick") : t("pages.moviesPage.secondaryActionDefault"),
)

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  activeMovieId.value = movies.value[0]?.id ?? ""
}
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
