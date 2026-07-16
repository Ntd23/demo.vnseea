// English description: Owns real movie catalog filters, loading states, and cursor pagination for the Movies page.

import type { MoviesRepository } from "../../domain/repositories/MoviesRepository";
import type {
  MovieFilterOption,
  MovieRecord,
  MoviesCatalogPage,
  MovieTabId,
} from "../../domain/types/movies.types";
import { createApiMoviesRepository } from "../../infrastructure/repositories/ApiMoviesRepository";

const PAGE_SIZE = 26;

const EMPTY_CATALOG: MoviesCatalogPage = {
  items: [],
  genres: [],
  countries: [],
  hasMore: false,
  nextOffset: 0,
};

const prependAllOption = (options: MovieFilterOption[]) => [
  { value: "", label: "Tất cả" },
  ...options,
];

const toErrorMessage = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : "Không thể tải danh sách phim.";

export function useMoviesPageVM(
  repository: MoviesRepository = createApiMoviesRepository(),
) {
  const route = useRoute();
  const readRouteQuery = (value: unknown) =>
    typeof value === "string"
      ? value.trim()
      : Array.isArray(value) && typeof value[0] === "string"
        ? value[0].trim()
        : "";
  const search = ref(readRouteQuery(route.query.search));
  const debouncedSearch = ref("");
  const activeTab = ref<MovieTabId>("new");
  const selectedGenre = ref(readRouteQuery(route.query.genre));
  const selectedCountry = ref(readRouteQuery(route.query.country));

  watch(
    search,
    (value, _previousValue, onCleanup) => {
      if (import.meta.server) {
        debouncedSearch.value = value;
        return;
      }

      const timeout = setTimeout(() => {
        debouncedSearch.value = value;
      }, 300);

      onCleanup(() => clearTimeout(timeout));
    },
    { immediate: true },
  );

  const filtersKey = computed(() =>
    JSON.stringify({
      search: debouncedSearch.value.trim(),
      tab: activeTab.value,
      genre: selectedGenre.value,
      country: selectedCountry.value,
    }),
  );

  const { data, status, error, refresh } = useAsyncData(
    "movies:catalog",
    () =>
      repository.getCatalog({
        search: debouncedSearch.value.trim() || undefined,
        tab: activeTab.value,
        genre: selectedGenre.value || undefined,
        country: selectedCountry.value || undefined,
        limit: PAGE_SIZE,
      }),
    {
      watch: [filtersKey],
      default: () => EMPTY_CATALOG,
    },
  );

  const items = ref<MovieRecord[]>([]);
  const hasMore = ref(false);
  const nextOffset = ref(0);
  const loadingMore = ref(false);

  watch(filtersKey, () => {
    items.value = [];
    hasMore.value = false;
    nextOffset.value = 0;
  });

  watch(
    data,
    (catalog) => {
      items.value = catalog.items;
      hasMore.value = catalog.hasMore;
      nextOffset.value = catalog.nextOffset;
    },
    { immediate: true },
  );

  const loading = computed(() => status.value === "pending");
  const errorMessage = computed(() =>
    error.value ? toErrorMessage(error.value) : "",
  );
  const genres = computed(() => prependAllOption(data.value.genres));
  const countries = computed(() => prependAllOption(data.value.countries));
  const genreLabelMap = computed<Record<string, string>>(() =>
    Object.fromEntries(
      data.value.genres.map((option) => [option.value, option.label]),
    ),
  );
  const hasActiveFilters = computed(() =>
    Boolean(
      search.value.trim() ||
      selectedGenre.value ||
      selectedCountry.value ||
      activeTab.value !== "new",
    ),
  );

  async function loadMore() {
    if (loadingMore.value || !hasMore.value || nextOffset.value <= 0) {
      return;
    }

    const requestKey = filtersKey.value;
    loadingMore.value = true;

    try {
      const response = await repository.getCatalog({
        search: debouncedSearch.value.trim() || undefined,
        tab: activeTab.value,
        genre: selectedGenre.value || undefined,
        country: selectedCountry.value || undefined,
        offset: nextOffset.value,
        limit: PAGE_SIZE,
      });

      if (requestKey !== filtersKey.value) {
        return;
      }

      const existingIds = new Set(items.value.map((movie) => movie.id));
      const newItems = response.items.filter(
        (movie) => !existingIds.has(movie.id),
      );
      items.value = [...items.value, ...newItems];
      hasMore.value = response.hasMore;
      nextOffset.value = response.nextOffset;
    } finally {
      loadingMore.value = false;
    }
  }

  function resetFilters() {
    search.value = "";
    activeTab.value = "new";
    selectedGenre.value = "";
    selectedCountry.value = "";
  }

  return {
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
    hasActiveFilters,
    loadMore,
    resetFilters,
    refresh,
  };
}
