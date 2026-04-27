import type {
  SearchCollectionType,
  SearchResultsByType,
  SearchSection,
  SearchSortKey,
  SearchSummaryCard,
  SearchResultType,
} from "../../domain/types/search.types"
import {
  normalizeSearchSort,
  normalizeSearchType,
  readSearchQueryValue,
  searchCollectionKinds,
  searchResultMatchesTokens,
  sortSearchResults,
  tokenizeSearchKeyword,
} from "../../domain/services/search-results.service"
import { useSearchDataSource } from "../../infrastructure/adapters/searchData.adapter"

const footerLinks = [
  { label: "community.search.footer.home", to: "/home" },
  { label: "community.search.footer.about", to: undefined },
  { label: "community.search.footer.contact", to: undefined },
  { label: "community.search.footer.privacy", to: undefined },
  { label: "community.search.footer.terms", to: undefined },
  { label: "community.search.footer.blog", to: "/blogs" },
  { label: "community.search.footer.developers", to: undefined },
]

export function useSearchPage() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const { isMobile } = useAppBreakpoints()

  const {
    quickKeywords,
    searchTabs,
    searchTypeOptions,
    searchSortOptions,
    resultsByType,
  } = useSearchDataSource()

  const normalizeType = (value: string) => normalizeSearchType(value, searchTypeOptions)
  const normalizeSort = (value: string) => normalizeSearchSort(value, searchSortOptions)

  const { searchQuery: searchText } = useDebouncedSearch({
    debounceMs: 500,
    syncUrl: true,
    queryParamName: "q",
  })

  const selectedType = ref<SearchResultType>(normalizeType(readSearchQueryValue(route.query.type)))
  const selectedSort = ref<SearchSortKey>(normalizeSort(readSearchQueryValue(route.query.sort)))

  const primaryFooterLinks = footerLinks.filter(link => link.to)
  const hasKeyword = computed(() => searchText.value.trim().length > 0)
  const idleMonogram = computed(() => searchText.value.trim().charAt(0).toUpperCase() || "A")
  const keywordTokens = computed(() => tokenizeSearchKeyword(searchText.value))

  function syncFromRoute() {
    const nextType = normalizeType(readSearchQueryValue(route.query.type))
    const nextSort = normalizeSort(readSearchQueryValue(route.query.sort))

    if (nextType !== selectedType.value) selectedType.value = nextType
    if (nextSort !== selectedSort.value) selectedSort.value = nextSort
  }

  watch(
    () => [route.query.type, route.query.sort],
    syncFromRoute,
  )

  function createNextQuery() {
    const nextQuery: Record<string, string> = {}

    Object.entries(route.query).forEach(([key, value]) => {
      const nextValue = readSearchQueryValue(value)
      if (nextValue) nextQuery[key] = nextValue
    })

    const nextKeyword = searchText.value.trim()
    if (nextKeyword) nextQuery.q = nextKeyword
    else delete nextQuery.q

    if (selectedType.value === "all") delete nextQuery.type
    else nextQuery.type = selectedType.value

    if (selectedSort.value === "relevance") delete nextQuery.sort
    else nextQuery.sort = selectedSort.value

    return nextQuery
  }

  function commitSearch() {
    void router.replace({
      path: "/search",
      query: createNextQuery(),
    })
  }

  watch(selectedType, commitSearch)
  watch(selectedSort, commitSearch)

  function matchesKeyword(item: SearchResultsByType[SearchCollectionType][number]) {
    return searchResultMatchesTokens(item, keywordTokens.value)
  }

  function sortItems(items: SearchResultsByType[SearchCollectionType]) {
    return sortSearchResults(items, selectedSort.value, searchText.value)
  }

  const filteredResults = computed<SearchResultsByType>(() => ({
    users: sortItems(resultsByType.value.users.filter(matchesKeyword)),
    pages: sortItems(resultsByType.value.pages.filter(matchesKeyword)),
    groups: sortItems(resultsByType.value.groups.filter(matchesKeyword)),
    posts: sortItems(resultsByType.value.posts.filter(matchesKeyword)),
  }))

  const tabItems = computed(() =>
    searchTabs.map((tab) => {
      const count = tab.value === "all"
        ? searchCollectionKinds.reduce((sum, kind) => sum + filteredResults.value[kind].length, 0)
        : filteredResults.value[tab.value].length

      return {
        ...tab,
        count,
      }
    }),
  )

  const totalResults = computed(() =>
    searchCollectionKinds.reduce((sum, kind) => sum + filteredResults.value[kind].length, 0),
  )

  const currentTypeLabel = computed(() =>
    searchTypeOptions.find(option => option.value === selectedType.value)
      ? t(`community.search.types.${selectedType.value}`)
      : t("community.search.types.all")
  )

  const summaryCards = computed<SearchSummaryCard[]>(() => [
    {
      label: t("community.search.summary.total.label"),
      value: totalResults.value,
      description: hasKeyword.value
        ? t("community.search.summary.total.descQuery", { keyword: searchText.value.trim() })
        : t("community.search.summary.total.descEmpty"),
    },
    {
      label: t("community.search.summary.users.label"),
      value: filteredResults.value.users.length,
      description: t("community.search.summary.users.desc"),
    },
    {
      label: t("community.search.summary.communities.label"),
      value: filteredResults.value.pages.length + filteredResults.value.groups.length,
      description: t("community.search.summary.communities.desc"),
    },
    {
      label: t("community.search.summary.posts.label"),
      value: filteredResults.value.posts.length,
      description: t("community.search.summary.posts.desc"),
    },
  ])

  const visibleSections = computed<SearchSection[]>(() => {
    if (!hasKeyword.value) return []

    const sections = searchCollectionKinds
      .filter(kind => selectedType.value === "all" || selectedType.value === kind)
      .map((kind) => {
        const source = filteredResults.value[kind]
        const config = searchTabs.find(tab => tab.value === kind)

        return {
          kind,
          label: config?.label ?? kind,
          description: config?.description ?? "",
          items: source,
          visibleItems: selectedType.value === "all"
            ? source.slice(0, isMobile.value ? 2 : 4)
            : source,
        }
      })

    return sections.filter(section => section.items.length > 0)
  })

  const resultHeading = computed(() =>
    totalResults.value === 1
      ? t("community.search.results.headingSingle", { type: currentTypeLabel.value.toLowerCase() })
      : t("community.search.results.headingMultiple", { count: totalResults.value, type: currentTypeLabel.value.toLowerCase() }),
  )

  const resultDescription = computed(() => {
    const keyword = searchText.value.trim()
    if (!keyword) return t("community.search.results.descEmpty")

    if (selectedType.value === "all") {
      return t("community.search.results.descAll", { keyword })
    }

    return t("community.search.results.descSpecific", {
      type: currentTypeLabel.value.toLowerCase(),
      keyword,
    })
  })

  function applyQuickKeyword(keyword: string) {
    searchText.value = keyword
    commitSearch()
  }

  function clearFilters() {
    searchText.value = ""
    selectedType.value = "all"
    selectedSort.value = "relevance"
    commitSearch()
  }

  function selectOnlyType(kind: SearchCollectionType) {
    selectedType.value = kind
    commitSearch()
  }

  function showAllResults() {
    selectedType.value = "all"
    commitSearch()
  }

  useSeoMeta({
    title: computed(() => {
      const keyword = searchText.value.trim()
      return keyword
        ? t("community.search.seoTitleQuery", { query: keyword })
        : t("community.search.seoTitle")
    }),
    description: computed(() => {
      const keyword = searchText.value.trim()
      return keyword
        ? t("community.search.seoDescQuery", { query: keyword })
        : t("community.search.seoDesc")
    }),
  })

  return {
    hasKeyword,
    idleMonogram,
    primaryFooterLinks,
    quickKeywords,
    resultDescription,
    resultHeading,
    searchSortOptions,
    searchText,
    searchTypeOptions,
    selectedSort,
    selectedType,
    summaryCards,
    tabItems,
    totalResults,
    visibleSections,
    applyQuickKeyword,
    clearFilters,
    commitSearch,
    selectOnlyType,
    showAllResults,
  }
}
