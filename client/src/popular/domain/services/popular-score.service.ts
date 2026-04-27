import type { PopularPost } from "../types/popular.types"

export const getPopularPostScore = (
  post: Pick<PopularPost, "stats">,
) => post.stats.likes + post.stats.comments * 2 + post.stats.shares * 3

export const formatPopularNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
