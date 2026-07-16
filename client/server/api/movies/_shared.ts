// English description: Fetches, validates, and maps the PHP movie catalog into frontend movie domain records.

import { createError, type H3Event } from "h3";
import { assertBackendApiSuccess } from "../../utils/backend-api-response";
import { createBackendApiClient } from "../../utils/backend-api-client";
import { createBackendMediaUrlResolver } from "../../utils/backend-media-url";
import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry";
import type {
  MovieDetailPage,
  MovieFilterOption,
  MovieRecord,
  MoviesCatalogPage,
  MoviesCatalogQuery,
} from "../../../src/movies/domain/types/movies.types";

type BackendMovie = Record<string, unknown>;

type BackendMoviesResponse = {
  api_status?: number | string;
  movies?: BackendMovie[];
  errors?: {
    error_text?: string;
  };
};

const BACKEND_CATALOG_LIMIT = 1000;

const PHTML_MOVIE_GENRES: MovieFilterOption[] = [
  { value: "action", label: "Action" },
  { value: "comedy", label: "Comedy" },
  { value: "drama", label: "Drama" },
  { value: "horror", label: "Horror" },
  { value: "mythological", label: "Mythological" },
  { value: "war", label: "War" },
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "sport", label: "Sport" },
  { value: "animation", label: "Animation" },
  { value: "crime", label: "Crime" },
  { value: "fantasy", label: "Fantasy" },
  { value: "musical", label: "Musical" },
  { value: "romance", label: "Romance" },
  { value: "thriller", label: "Thriller" },
  { value: "history", label: "History" },
  { value: "documentary", label: "Documentary" },
  { value: "tvshow", label: "TV Show" },
];

const PHTML_MOVIE_COUNTRIES: MovieFilterOption[] = [
  { value: "united-states", label: "United States" },
  { value: "china", label: "China" },
  { value: "india", label: "India" },
  { value: "iran", label: "Iran" },
  { value: "japan", label: "Japan" },
  { value: "turkey", label: "Turkey" },
  { value: "russia", label: "Russia" },
  { value: "france", label: "France" },
  { value: "united-kingdom", label: "United Kingdom" },
];

const asString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

const asNumber = (value: unknown) => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};

const toFilterLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(
      (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`,
    )
    .join(" ");

const collectFilterOptions = (
  movies: MovieRecord[],
  field: "genre" | "country",
  defaults: MovieFilterOption[],
): MovieFilterOption[] => {
  const options = new Map(
    defaults.map((option) => [option.value.toLocaleLowerCase(), option]),
  );
  const extraValues = [
    ...new Set(movies.map((movie) => movie[field]).filter(Boolean)),
  ].sort((left, right) => left.localeCompare(right));

  for (const value of extraValues) {
    const normalizedValue = value.toLocaleLowerCase();
    if (!options.has(normalizedValue)) {
      options.set(normalizedValue, {
        value,
        label: toFilterLabel(value),
      });
    }
  }

  return [...options.values()];
};

const formatRuntime = (minutes: number) => {
  if (minutes <= 0) return "";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const splitStars = (value: unknown) =>
  asString(value)
    .split(",")
    .map((star) => star.trim())
    .filter(Boolean);

const filterAndSortMovies = (
  movies: MovieRecord[],
  query: MoviesCatalogQuery,
) => {
  const search = asString(query.search).toLocaleLowerCase();
  const currentYear = new Date().getFullYear();
  const recommendedQualities = new Set(["hd", "dvd", "hd-tv"]);

  const filtered = movies.filter((movie) => {
    if (query.genre && movie.genre !== query.genre) return false;
    if (query.country && movie.country !== query.country) return false;

    if (query.tab === "recommended") {
      const quality = movie.quality.toLocaleLowerCase();
      if (movie.year !== currentYear && !recommendedQualities.has(quality)) {
        return false;
      }
    }

    if (!search) return true;

    return [
      movie.title,
      movie.director,
      movie.summary,
      movie.genre,
      movie.country,
      ...movie.stars,
    ].some((value) => value.toLocaleLowerCase().includes(search));
  });

  return filtered.sort((left, right) => {
    if (query.tab === "watched") {
      return right.views - left.views || right.id - left.id;
    }

    return right.id - left.id;
  });
};

const mapMovie = (
  movie: BackendMovie,
  resolveBackendUrl: ReturnType<typeof createBackendMediaUrlResolver>,
): MovieRecord => {
  const id = asNumber(movie.id);
  const runtimeMinutes = Math.max(0, Math.round(asNumber(movie.duration)));

  return {
    id,
    title: asString(movie.name) || `Movie ${id}`,
    genre: asString(movie.genre),
    country: asString(movie.country),
    year: Math.max(0, Math.round(asNumber(movie.release))),
    runtime: formatRuntime(runtimeMinutes),
    runtimeMinutes,
    rating: Math.max(0, asNumber(movie.rating)),
    director: asString(movie.producer),
    summary: asString(movie.description),
    cover: resolveBackendUrl(movie.cover),
    source: resolveBackendUrl(movie.source || movie.video),
    views: Math.max(0, asNumber(movie.views)),
    quality: asString(movie.quality),
    stars: splitStars(movie.stars),
    embedUrl: resolveBackendUrl(movie.iframe),
    to: appRoutes.movieDetail(id),
  };
};

export async function fetchMovieDetail(
  event: H3Event,
  id: number,
): Promise<MovieDetailPage> {
  const client = createBackendApiClient(event);
  const detailResponse = assertBackendApiSuccess(
    await client.post<BackendMoviesResponse, Record<string, unknown>>(
      "get-movies",
      {
        id,
        limit: 1,
      },
    ),
    "Unable to load movie.",
  );
  const resolveBackendUrl = createBackendMediaUrlResolver(event);
  const rawMovie = detailResponse.movies?.[0];

  if (!rawMovie) {
    throw createError({
      statusCode: 404,
      statusMessage: "Movie not found.",
    });
  }

  const movie = mapMovie(rawMovie, resolveBackendUrl);
  const relatedResponse = assertBackendApiSuccess(
    await client.post<BackendMoviesResponse, Record<string, unknown>>(
      "get-movies",
      {
        genre: movie.genre || undefined,
        limit: 8,
      },
    ),
    "Unable to load related movies.",
  );
  const relatedCandidates = (relatedResponse.movies ?? []).map((item) =>
    mapMovie(item, resolveBackendUrl),
  );
  const otherRelatedMovies = relatedCandidates.filter(
    (item) => item.id !== movie.id,
  );
  const related = (
    otherRelatedMovies.length > 0 ? otherRelatedMovies : relatedCandidates
  ).slice(0, 6);

  return {
    movie,
    related,
  };
}

export async function fetchMoviesCatalog(
  event: H3Event,
  query: MoviesCatalogQuery,
): Promise<MoviesCatalogPage> {
  const limit = Math.max(1, Math.min(Math.round(query.limit ?? 26), 50));
  const offset = Math.max(0, Math.round(query.offset ?? 0));
  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<
      BackendMoviesResponse,
      Record<string, unknown>
    >("get-movies", {
      limit: BACKEND_CATALOG_LIMIT,
    }),
    "Unable to load movies.",
  );
  const resolveBackendUrl = createBackendMediaUrlResolver(event);
  const allMovies = (response.movies ?? []).map((movie) =>
    mapMovie(movie, resolveBackendUrl),
  );
  const filteredMovies = filterAndSortMovies(allMovies, query);
  const pageItems = filteredMovies.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;

  return {
    items: pageItems,
    genres: collectFilterOptions(allMovies, "genre", PHTML_MOVIE_GENRES),
    countries: collectFilterOptions(
      allMovies,
      "country",
      PHTML_MOVIE_COUNTRIES,
    ),
    hasMore: nextOffset < filteredMovies.length,
    nextOffset: nextOffset < filteredMovies.length ? nextOffset : 0,
  };
}
