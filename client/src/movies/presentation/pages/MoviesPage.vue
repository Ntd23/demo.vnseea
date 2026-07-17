<!-- English description: Displays the real backend movie catalog with search, filters, sorting tabs, and cursor pagination. -->
<template>
  <div class="movies-page py-4">
    <div class="container mx-auto">
      <section class="movies-page__filters">
        <div class="movies-page__search">
          <Icon name="i-ph-magnifying-glass-bold" class="movies-page__search-icon" />
          <input
            v-model="search"
            class="movies-page__search-input"
            :placeholder="$t('pages.moviesPage.searchPlaceholder')"
            type="text"
          >
        </div>

        <div ref="filterMenuRef" class="movies-page__filter">
          <button
            class="movies-page__filter-button"
            type="button"
            :aria-expanded="isFilterOpen"
            @click.stop="isFilterOpen = !isFilterOpen"
          >
            <Icon name="i-ph-funnel-simple-bold" class="h-5 w-5" />
          </button>

          <div v-if="isFilterOpen" class="movies-page__filter-menu" @click.stop>
            <button class="movies-page__filter-section" type="button" @click="genreOpen = !genreOpen">
              <span>Thể loại</span>
              <Icon name="i-ph-caret-down-bold" class="h-4 w-4" :class="{ 'rotate-180': genreOpen }" />
            </button>
            <div v-if="genreOpen" class="movies-page__filter-list">
              <button
                v-for="genre in genres"
                :key="genre.value"
                class="movies-page__filter-item"
                :class="{ 'movies-page__filter-item--active': selectedGenre === genre.value }"
                type="button"
                @click="selectGenre(genre.value)"
              >
                {{ genre.label }}
              </button>
            </div>

            <button class="movies-page__filter-section" type="button" @click="countryOpen = !countryOpen">
              <span>Quốc gia</span>
              <Icon name="i-ph-caret-down-bold" class="h-4 w-4" :class="{ 'rotate-180': countryOpen }" />
            </button>
            <div v-if="countryOpen" class="movies-page__filter-list">
              <button
                v-for="country in countries"
                :key="country.value"
                class="movies-page__filter-item"
                :class="{ 'movies-page__filter-item--active': selectedCountry === country.value }"
                type="button"
                @click="selectCountry(country.value)"
              >
                {{ country.label }}
              </button>
            </div>

            <button class="movies-page__reset" type="button" @click="resetPageFilters">
              <Icon name="i-ph-arrow-counter-clockwise-bold" class="h-4 w-4" />
              {{ $t("pages.moviesPage.resetFilters") }}
            </button>
          </div>
        </div>
      </section>

      <section class="movies-page__tabs" aria-label="Movie filters">
        <MoviesTabs v-model="activeTab" :tabs="navigationTabs" />
      </section>

      <section class="movies-page__content">
        <div v-if="loading && items.length === 0" class="movies-page__grid" aria-busy="true">
          <div v-for="index in 12" :key="index" class="movies-page__skeleton" aria-hidden="true">
            <div class="movies-page__skeleton-poster" />
            <div class="movies-page__skeleton-line movies-page__skeleton-line--title" />
            <div class="movies-page__skeleton-line" />
          </div>
        </div>

        <div v-else-if="errorMessage" class="movies-page__empty" role="alert">
          <Icon name="i-ph-warning-circle-bold" class="h-9 w-9" />
          <span>{{ errorMessage }}</span>
          <button type="button" @click="refresh">Thử lại</button>
        </div>

        <div v-else-if="items.length > 0" class="movies-page__grid">
          <MoviesCard
            v-for="movie in items"
            :key="movie.id"
            :genre-label="genreLabelMap[movie.genre] || movie.genre"
            :movie="movie"
          />
        </div>

        <div v-else class="movies-page__empty">
          <Icon name="i-ph-film-strip-bold" class="h-9 w-9" />
          <span>{{ $t("pages.moviesPage.emptyTitle") }}</span>
          <button type="button" @click="resetPageFilters">
            {{ $t("pages.moviesPage.resetFilters") }}
          </button>
        </div>

        <div v-if="hasMore && !errorMessage" class="movies-page__load-more">
          <button
            class="movies-page__load-more-button"
            type="button"
            :disabled="loadingMore"
            @click="loadMore"
          >
            <Icon
              :name="loadingMore ? 'i-ph-spinner-gap-bold' : 'i-ph-arrow-down-bold'"
              class="h-4 w-4"
              :class="{ 'movies-page__spinner': loadingMore }"
            />
            {{ loadingMore ? "Đang tải" : "Tải thêm" }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import MoviesCard from "../components/Card.vue"
import MoviesTabs from "../components/Tabs.vue"
import type { MovieTabId } from "../../domain/types/movies.types"
import { useMoviesPageVM } from "../../application/view-models/useMoviesPageVM"

const { t: translate } = useI18n()
const {
  search,
  activeTab,
  selectedGenre,
  selectedCountry,
  items,
  genres,
  countries,
  genreLabelMap,
  loading,
  loadingMore,
  errorMessage,
  hasMore,
  loadMore,
  resetFilters,
  refresh,
} = useMoviesPageVM()

useSeoMeta({
  title: () => translate("pages.moviesPage.seoTitle"),
  description: () => translate("pages.moviesPage.seoDescription"),
})

const isFilterOpen = ref(false)
const genreOpen = ref(false)
const countryOpen = ref(false)
const filterMenuRef = ref<HTMLElement | null>(null)

const navigationTabs = computed(() => [
  { id: "new" as MovieTabId, label: translate("pages.moviesPage.tabNew"), icon: "i-ph-film-strip-bold" },
  { id: "recommended" as MovieTabId, label: translate("pages.moviesPage.tabRecommended"), icon: "i-ph-star-bold" },
  { id: "watched" as MovieTabId, label: translate("pages.moviesPage.tabWatched"), icon: "i-ph-trend-up-bold" },
])

const selectGenre = (value: string) => {
  selectedGenre.value = value
}

const selectCountry = (value: string) => {
  selectedCountry.value = value
}

const resetPageFilters = () => {
  resetFilters()
  isFilterOpen.value = false
  genreOpen.value = false
  countryOpen.value = false
}

const closeFilterOnOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node | null

  if (isFilterOpen.value && target && !filterMenuRef.value?.contains(target)) {
    isFilterOpen.value = false
  }
}

onMounted(() => window.addEventListener("click", closeFilterOnOutsideClick))
onUnmounted(() => window.removeEventListener("click", closeFilterOnOutsideClick))
</script>

<style scoped>
.movies-page {
  background: #f0f2f5;
}

.movies-page__head {
  position: relative;
  z-index: 1;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: #f9f9f9;
}

.movies-page__title {
  display: flex;
  height: 64px;
  align-items: center;
  gap: 10px;
  color: #111827;
  font-size: 24px;
  font-weight: 900;
}

.movies-page__title :deep(svg) {
  color: #0a58ca;
}

.movies-page__backdrop {
  height: 24px;
  background: #ffffff;
}

.movies-page__filters {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: -8px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.movies-page__search {
  position: relative;
  min-width: 0;
  flex: 1;
}

.movies-page__search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  width: 20px;
  height: 20px;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.movies-page__search-input {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface-hover);
  padding: 0 14px 0 46px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  outline: none;
  transition: border-color var(--duration-fast) var(--ease-default), background-color var(--duration-fast) var(--ease-default);
}

.movies-page__search-input:focus {
  border-color: var(--border-brand);
  background: var(--bg-surface);
}

.movies-page__filter {
  position: relative;
  flex: 0 0 auto;
}

.movies-page__filter-button {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default);
}

.movies-page__filter-button:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-brand);
}

.movies-page__filter-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: min(320px, calc(100vw - 32px));
  max-height: min(70vh, 560px);
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 8px 0;
  box-shadow: var(--shadow-lg);
}

.movies-page__filter-section,
.movies-page__filter-item,
.movies-page__reset {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 0;
  background: transparent;
  padding: 11px 16px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default), color var(--duration-fast) var(--ease-default);
}

.movies-page__filter-section:hover,
.movies-page__filter-item:hover,
.movies-page__reset:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-brand);
}

.movies-page__filter-list {
  padding: 2px 0 8px 14px;
}

.movies-page__filter-item {
  justify-content: flex-start;
  padding: 8px 16px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.movies-page__filter-item--active {
  color: var(--text-brand) !important;
  font-weight: 800;
}

.movies-page__reset {
  border-top: 1px solid var(--border-default);
  justify-content: flex-start;
  color: var(--text-brand);
}

.movies-page__tabs {
  margin-top: 18px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 12px 14px 4px; /* Reduced bottom padding since scrollbar has its own padding */
  box-shadow: var(--shadow-sm);
}

.movies-page__content {
  margin-top: 18px;
}

.movies-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.movies-page__skeleton-poster,
.movies-page__skeleton-line {
  background: linear-gradient(90deg, #e5e7eb 25%, #f8fafc 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: movies-skeleton 1.2s ease-in-out infinite;
}

.movies-page__skeleton-poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 3px;
}

.movies-page__skeleton-line {
  width: 58%;
  height: 12px;
  margin-top: 8px;
  border-radius: 2px;
}

.movies-page__skeleton-line--title {
  width: 82%;
  height: 15px;
  margin-top: 11px;
}

.movies-page__empty {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
  color: #64748b;
  font-weight: 800;
  text-align: center;
}

.movies-page__empty button {
  border: 0;
  background: transparent;
  color: #0a58ca;
  font-weight: 900;
  cursor: pointer;
}

.movies-page__load-more {
  display: flex;
  justify-content: center;
  padding: 26px 0 8px;
}

.movies-page__load-more-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dbe1ea;
  background: #ffffff;
  padding: 10px 22px;
  color: #000000;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.movies-page__load-more-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.movies-page__spinner {
  animation: movies-spin 0.8s linear infinite;
}

@keyframes movies-skeleton {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@keyframes movies-spin {
  to {
    transform: rotate(360deg);
  }
}

.rotate-180 {
  transform: rotate(180deg);
}

@media (min-width: 640px) {
  .movies-page__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .movies-page__grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .movies-page__grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
