import type { ComputedRef } from "vue"
import type { MovieCategory, MovieCollection, MovieItem, UpcomingMovie } from "../types/movies.types"

export interface MoviesRepository {
  categories: ComputedRef<MovieCategory[]>
  movies: ComputedRef<MovieItem[]>
  collections: ComputedRef<MovieCollection[]>
  upcoming: ComputedRef<UpcomingMovie[]>
}
