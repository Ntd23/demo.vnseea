// English description: Exposes the authenticated backend movie catalog through the Nuxt API bridge.

import { getQuery } from "h3";
import { fetchMoviesCatalog } from "./_shared";
import type { MovieTabId } from "../../../src/movies/domain/types/movies.types";

const asQueryString = (value: unknown) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0].trim() : "";
  }

  return typeof value === "string" ? value.trim() : "";
};

const asPositiveInteger = (value: unknown, fallback = 0) => {
  const normalized = Number(asQueryString(value));
  return Number.isFinite(normalized) && normalized > 0
    ? Math.round(normalized)
    : fallback;
};

const normalizeTab = (value: unknown): MovieTabId => {
  const normalized = asQueryString(value);
  return normalized === "recommended" || normalized === "watched"
    ? normalized
    : "new";
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return await fetchMoviesCatalog(event, {
    search: asQueryString(query.search) || undefined,
    genre: asQueryString(query.genre) || undefined,
    country: asQueryString(query.country) || undefined,
    tab: normalizeTab(query.tab),
    offset: asPositiveInteger(query.offset) || undefined,
    limit: asPositiveInteger(query.limit, 26),
  });
});
