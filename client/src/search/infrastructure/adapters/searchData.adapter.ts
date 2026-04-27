import type { ComputedRef } from "vue"
import { useMockSearchData } from "../../../../app/composables/useMockSearchData"
import type {
  SearchOption,
  SearchResultType,
  SearchResultsByType,
  SearchSortKey,
  SearchTabItem,
} from "../../domain/types/search.types"

export interface SearchDataSource {
  quickKeywords: string[]
  searchTabs: SearchTabItem[]
  searchTypeOptions: SearchOption<SearchResultType>[]
  searchSortOptions: SearchOption<SearchSortKey>[]
  resultsByType: ComputedRef<SearchResultsByType>
}

export function useSearchDataSource(): SearchDataSource {
  return useMockSearchData() as unknown as SearchDataSource
}
