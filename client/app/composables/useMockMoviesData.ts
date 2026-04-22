import { computed } from "vue"
import { resolveI18nMessage } from "~/utils/resolveI18nMessage"

export type MovieCategoryKey =
  | "all"
  | "community"
  | "business"
  | "education"
  | "documentary"
  | "technology"

export type MovieCategory = {
  label: string
  value: MovieCategoryKey
  icon: string
}

export type MockMovie = {
  id: string
  title: string
  category: Exclude<MovieCategoryKey, "all">
  year: number
  runtime: string
  runtimeMinutes: number
  rating: number
  director: string
  summary: string
  cover: string
  backdrop: string
  accent: string
  tags: string[]
  isPremiere: boolean
  isEditorsPick: boolean
  to: string
  companionTo: string
}

export type MovieCollection = {
  title: string
  description: string
  icon: string
  to: string
  accent: string
}

export type UpcomingMovie = {
  title: string
  dayLabel: string
  timeLabel: string
  formatLabel: string
  note: string
}

export const useMockMoviesData = () => {
  const { tm, rt } = useI18n()
  const localized = <T>(key: string) =>
    resolveI18nMessage(tm(key), message => rt(message as never)) as T

  const categories = computed(() =>
    localized<MovieCategory[]>("pages.moviesPage.categories"),
  )

  const movies = computed(() =>
    localized<MockMovie[]>("pages.moviesPage.movies"),
  )

  const collections = computed(() =>
    localized<MovieCollection[]>("pages.moviesPage.collections"),
  )

  const upcoming = computed(() =>
    localized<UpcomingMovie[]>("pages.moviesPage.upcoming"),
  )

  return {
    categories,
    movies,
    collections,
    upcoming,
  }
}

export const formatMovieNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, { notation: value >= 10000 ? "compact" : "standard" }).format(value)
