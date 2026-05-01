import type { SearchResultsByType } from "../types/search.types"

export interface SearchRepository {
  search(keyword: string, limit?: number): Promise<SearchResultsByType>
}
