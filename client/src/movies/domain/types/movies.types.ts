export type MovieCategoryKey =
  | "all"
  | "community"
  | "business"
  | "education"
  | "documentary"
  | "technology"

export interface MovieCategory {
  label: string
  value: MovieCategoryKey
  icon: string
}

export interface MovieItem {
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

export interface MovieCollection {
  title: string
  description: string
  icon: string
  to: string
  accent: string
}

export interface UpcomingMovie {
  title: string
  dayLabel: string
  timeLabel: string
  formatLabel: string
  note: string
}
