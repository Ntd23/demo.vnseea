import type { ComputedRef } from "vue"
import { useMockMoviesData } from "../../../../app/composables/useMockMoviesData"
import type { MovieCategory, MovieCollection, MovieItem, UpcomingMovie } from "../../domain/types/movies.types"

export function useMoviesDataSource() {
  const data = useMockMoviesData()

  return {
    categories: data.categories as ComputedRef<MovieCategory[]>,
    movies: data.movies as ComputedRef<MovieItem[]>,
    collections: data.collections as ComputedRef<MovieCollection[]>,
    upcoming: data.upcoming as ComputedRef<UpcomingMovie[]>,
  }
}
