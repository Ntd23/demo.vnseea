import type {
  SearchCollectionType,
  SearchOption,
  SearchResultItem,
  SearchResultType,
  SearchSortKey,
} from "../types/search.types"

export const searchCollectionKinds: SearchCollectionType[] = ["users", "pages", "groups", "posts"]

export function readSearchQueryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "")
  return typeof value === "string" ? value : ""
}

export function normalizeSearchKeyword(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

export function tokenizeSearchKeyword(value: string) {
  return normalizeSearchKeyword(value)
    .split(" ")
    .map(token => token.replace(/^#+/, ""))
    .filter(Boolean)
}

export function normalizeSearchType(
  value: string,
  options: SearchOption<SearchResultType>[],
): SearchResultType {
  return options.some(option => option.value === value)
    ? value as SearchResultType
    : "all"
}

export function normalizeSearchSort(
  value: string,
  options: SearchOption<SearchSortKey>[],
): SearchSortKey {
  return options.some(option => option.value === value)
    ? value as SearchSortKey
    : "relevance"
}

export function searchResultMatchesTokens(item: SearchResultItem, tokens: string[]) {
  if (!tokens.length) return true

  return tokens.every(token => item.searchableText.includes(token))
}

export function scoreSearchResult(item: SearchResultItem, keywordValue: string) {
  const keyword = normalizeSearchKeyword(keywordValue).replace(/^#+/, "")
  if (!keyword) return item.popularityScore * 0.05 + item.recentScore * 0.3

  const title = item.title.toLowerCase()
  const subtitle = item.subtitle.toLowerCase()
  const description = item.description.toLowerCase()
  const normalizedTags = item.tags.map(tag => tag.toLowerCase())

  let score = item.popularityScore * 0.05 + item.recentScore * 0.3

  if (title.includes(keyword)) score += 44
  if (subtitle.includes(keyword)) score += 20
  if (description.includes(keyword)) score += 12
  if (normalizedTags.some(tag => tag.includes(keyword))) score += 18
  if (item.searchableText.startsWith(keyword)) score += 10

  return score
}

export function sortSearchResults(
  items: SearchResultItem[],
  sortKey: SearchSortKey,
  keyword: string,
) {
  return items.slice().sort((left, right) => {
    if (sortKey === "popular") {
      return right.popularityScore - left.popularityScore || right.recentScore - left.recentScore
    }

    if (sortKey === "recent") {
      return right.recentScore - left.recentScore || right.popularityScore - left.popularityScore
    }

    return scoreSearchResult(right, keyword) - scoreSearchResult(left, keyword)
      || right.popularityScore - left.popularityScore
  })
}
