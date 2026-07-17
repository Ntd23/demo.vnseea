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
  const initialSearch = readRouteQuery(route.query.search);
  const search = ref(initialSearch);
  const debouncedSearch = ref(initialSearch);
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

  const appendedItems = ref<MovieRecord[]>([]);
  const pagination = ref<{
    hasMore: boolean;
    nextOffset: number;
  } | null>(null);
  const loadingMore = ref(false);

  watch(filtersKey, () => {
    appendedItems.value = [];
    pagination.value = null;
  });

  const items = computed<MovieRecord[]>(() => {
    const baseItems = data.value.items;
    const baseIds = new Set(baseItems.map((movie) => movie.id));

    return [
      ...baseItems,
      ...appendedItems.value.filter((movie) => !baseIds.has(movie.id)),
    ];
  });
  const hasMore = computed(
    () => pagination.value?.hasMore ?? data.value.hasMore,
  );
  const nextOffset = computed(
    () => pagination.value?.nextOffset ?? data.value.nextOffset,
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
      appendedItems.value = [...appendedItems.value, ...newItems];
      pagination.value = {
        hasMore: response.hasMore,
        nextOffset: response.nextOffset,
      };
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
