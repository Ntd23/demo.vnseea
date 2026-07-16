// English description: Defines backend-backed movie catalog entities, filters, tabs, and pagination contracts.

export type MovieTabId = "new" | "recommended" | "watched";

export type MovieFilterOption = {
  label: string;
  value: string;
};

export type MovieRecord = {
  id: number;
  title: string;
  genre: string;
  country: string;
  year: number;
  runtime: string;
  runtimeMinutes: number;
  rating: number;
  director: string;
  summary: string;
  cover: string;
  source: string;
  views: number;
  quality: string;
  stars: string[];
  embedUrl: string;
  to: string;
};

export type MovieDetailPage = {
  movie: MovieRecord;
  related: MovieRecord[];
};

export type MoviesCatalogQuery = {
  search?: string;
  genre?: string;
  country?: string;
  tab?: MovieTabId;
  offset?: number;
  limit?: number;
};

export type MoviesCatalogPage = {
  items: MovieRecord[];
  genres: MovieFilterOption[];
  countries: MovieFilterOption[];
  hasMore: boolean;
  nextOffset: number;
};
