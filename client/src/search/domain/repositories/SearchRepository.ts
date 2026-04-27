import type {
  SearchOption,
  SearchResultType,
  SearchResultsByType,
  SearchSortKey,
  SearchTabItem,
} from "../types/search.types"

export interface SearchRepository {
  getQuickKeywords(): string[]
  getSearchTabs(): SearchTabItem[]
  getSearchTypeOptions(): SearchOption<SearchResultType>[]
  getSearchSortOptions(): SearchOption<SearchSortKey>[]
  getResultsByType(): SearchResultsByType
}
