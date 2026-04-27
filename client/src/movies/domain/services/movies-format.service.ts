import type { MovieItem } from "../types/movies.types"

export const formatMovieNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)

export function movieMatchesKeyword(movie: MovieItem, keyword: string, categoryLabel = "") {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return true

  return [
    movie.title,
    movie.director,
    movie.summary,
    ...movie.tags,
    categoryLabel,
  ].some(field => field.toLowerCase().includes(normalizedKeyword))
}
