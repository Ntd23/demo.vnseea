<template>
  <div class="space-y-6 pb-10">
    <!-- Legacy Header -->
    <div class="border-b border-[var(--border-default)]" style="background-color: #f9f9f9 !important;">
      <div class="container mx-auto h-16 flex items-center px-4 sm:px-6">
        <h1 class="flex items-center gap-3 text-2xl font-black text-[var(--text-primary)]">
          <Icon name="i-ph-movie-bold" class="h-8 w-8" style="color: #0a58ca !important;" />
          {{ $t("pages.moviesPage.heroEyebrow") }}
        </h1>
      </div>
    </div>

    <div class="container mx-auto px-4 sm:px-6">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <!-- Main Content -->
        <div class="space-y-6">
          <!-- Filters & Tabs -->
          <div class="space-y-4">
            <MoviesFilters
              v-model:search="search"
              v-model:selected-category="selectedCategory"
              :categories="categories"
              :placeholder="$t('pages.moviesPage.searchPlaceholder')"
            />
            
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <MoviesTabs
                v-model="activeTab"
                :tabs="navigationTabs"
              />

              <div class="flex items-center gap-2">
                <!-- Genre Dropdown -->
                <div class="relative">
                  <button
                    class="flex h-11 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-4 text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition shadow-sm"
                    @click="isGenreOpen = !isGenreOpen; isCountryOpen = false"
                  >
                    <Icon name="i-ph-tag-bold" class="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span>{{ selectedGenreLabel }}</span>
                    <Icon name="i-ph-caret-down-bold" class="h-3 w-3 opacity-50 transition-transform" :class="{ 'rotate-180': isGenreOpen }" />
                  </button>
                  <div v-if="isGenreOpen" class="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--border-default)] bg-white p-2 shadow-xl space-y-1">
                    <button
                      v-for="genre in genres"
                      :key="genre.value"
                      class="flex w-full items-center px-4 py-2.5 rounded-lg text-left text-[13px] font-bold transition hover:bg-[var(--bg-surface-hover)]"
                      :class="selectedGenre === genre.value ? 'bg-[var(--color-primary-50)] text-[#0a58ca]' : 'text-[var(--text-secondary)]'"
                      @click="selectedGenre = genre.value; isGenreOpen = false"
                    >
                      {{ genre.label }}
                    </button>
                  </div>
                </div>

                <!-- Country Dropdown -->
                <div class="relative">
                  <button
                    class="flex h-11 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-4 text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition shadow-sm"
                    @click="isCountryOpen = !isCountryOpen; isGenreOpen = false"
                  >
                    <Icon name="i-ph-globe-bold" class="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span>{{ selectedCountryLabel }}</span>
                    <Icon name="i-ph-caret-down-bold" class="h-3 w-3 opacity-50 transition-transform" :class="{ 'rotate-180': isCountryOpen }" />
                  </button>
                  <div v-if="isCountryOpen" class="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--border-default)] bg-white p-2 shadow-xl space-y-1">
                    <button
                      v-for="country in countries"
                      :key="country.value"
                      class="flex w-full items-center px-4 py-2.5 rounded-lg text-left text-[13px] font-bold transition hover:bg-[var(--bg-surface-hover)]"
                      :class="selectedCountry === country.value ? 'bg-[var(--color-primary-50)] text-[#0a58ca]' : 'text-[var(--text-secondary)]'"
                      @click="selectedCountry = country.value; isCountryOpen = false"
                    >
                      {{ country.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Movies Grid -->
          <div v-if="displayMovies.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            <MoviesCard
              v-for="movie in displayMovies"
              :key="movie.id"
              :category-label="categoryLabelMap[movie.category]"
              :movie="movie"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-default)] bg-white py-16 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)]">
              <Icon name="i-ph-popcorn-bold" class="h-10 w-10" />
            </div>
            <h3 class="mt-4 text-lg font-bold text-[var(--text-primary)]">{{ $t("pages.moviesPage.emptyTitle") }}</h3>
            <p class="mt-2 text-[var(--text-secondary)]">{{ $t("pages.moviesPage.emptyDescription") }}</p>
            <button
              class="mt-6 font-bold text-[var(--color-primary-600)] hover:underline"
              @click="resetFilters"
            >
              {{ $t("pages.moviesPage.resetFilters") }}
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <MoviesSidebar
          :active-movie-id="activeMovieId"
          :picks="topRatedMovies"
          :picks-eyebrow="$t('pages.moviesPage.sidebarPicksEyebrow')"
          :picks-title="$t('pages.moviesPage.sidebarPicksTitle')"
          :upcoming="upcoming"
          :upcoming-eyebrow="$t('pages.moviesPage.sidebarUpcomingEyebrow')"
          :upcoming-title="$t('pages.moviesPage.sidebarUpcomingTitle')"
          @select="activeMovieId = $event"
        />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import MoviesCard from "../components/Card.vue"
import MoviesFilters from "../components/Filters.vue"
import MoviesTabs from "../components/Tabs.vue"
import type { MovieTabId } from "../components/Tabs.vue"
import MoviesSidebar from "../components/Sidebar.vue"
import type { MovieCategoryKey } from "../../application/composables/useMockMoviesData"
import { useMockMoviesData } from "../../application/composables/useMockMoviesData"

const { categories, movies, upcoming } = useMockMoviesData()
const { t: translate } = useI18n()

useSeoMeta({
  title: () => translate("pages.moviesPage.seoTitle"),
  description: () => translate("pages.moviesPage.seoDescription"),
})

const search = ref("")
const selectedCategory = ref<MovieCategoryKey>("all")
const activeTab = ref<MovieTabId>("new")
const activeMovieId = ref(movies.value[0]?.id ?? "")

// New Dropdown States
const isGenreOpen = ref(false)
const isCountryOpen = ref(false)
const selectedGenre = ref("all")
const selectedCountry = ref("all")

const genres = [
  { label: "Thể loại", value: "all" },
  { label: "Hành động", value: "action" },
  { label: "Hài hước", value: "comedy" },
  { label: "Tình cảm", value: "romance" },
  { label: "Kinh dị", value: "horror" },
  { label: "Viễn tưởng", value: "sci-fi" },
]

const countries = [
  { label: "Quốc gia", value: "all" },
  { label: "Việt Nam", value: "vietnam" },
  { label: "Âu Mỹ", value: "usa" },
  { label: "Hàn Quốc", value: "korea" },
  { label: "Nhật Bản", value: "japan" },
  { label: "Trung Quốc", value: "china" },
]

const selectedGenreLabel = computed(() => {
  const g = genres.find(item => item.value === selectedGenre.value)
  return g ? g.label : "Thể loại"
})

const selectedCountryLabel = computed(() => {
  const c = countries.find(item => item.value === selectedCountry.value)
  return c ? c.label : "Quốc gia"
})

const navigationTabs = computed(() => [
  { id: "new" as MovieTabId, label: translate("pages.moviesPage.tabNew"), icon: "i-ph-film-strip-bold" },
  { id: "recommended" as MovieTabId, label: translate("pages.moviesPage.tabRecommended"), icon: "i-ph-star-bold" },
  { id: "watched" as MovieTabId, label: translate("pages.moviesPage.tabWatched"), icon: "i-ph-fire-bold" },
])

const categoryLabelMap = computed(() =>
  Object.fromEntries(
    categories.value.map(category => [category.value, category.label]),
  ) as Record<MovieCategoryKey, string>,
)

const filteredMovies = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return movies.value.filter((movie) => {
    const matchesCategory = selectedCategory.value === "all" || movie.category === selectedCategory.value
    const matchesGenre = selectedGenre.value === "all" || movie.genre === selectedGenre.value
    const matchesCountry = selectedCountry.value === "all" || movie.country === selectedCountry.value
    
    const matchesKeyword = keyword.length === 0 || [
      movie.title,
      movie.director,
      movie.summary,
      ...movie.tags,
      categoryLabelMap.value[movie.category],
    ].some(field => field.toLowerCase().includes(keyword))

    return matchesCategory && matchesGenre && matchesCountry && matchesKeyword
  })
})

const displayMovies = computed(() => {
  const items = [...filteredMovies.value]
  
  if (activeTab.value === "recommended") {
    return items.filter(m => m.isEditorsPick)
  }
  
  if (activeTab.value === "watched") {
    // Proxy for most watched: sort by rating
    return items.sort((a, b) => b.rating - a.rating)
  }
  
  // Default: New (assume default order is newest)
  return items
})

const topRatedMovies = computed(() =>
  movies.value
    .slice()
    .sort((left, right) => right.rating - left.rating)
    .slice(0, 4),
)

const resetFilters = () => {
  search.value = ""
  selectedCategory.value = "all"
  activeTab.value = "new"
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
