// English description: Returns one backend movie and its related movie recommendations.

import { createError, getRouterParam } from "h3";
import { fetchMovieDetail } from "./_shared";

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(String(getRouterParam(event, "id") || ""), 10);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Movie not found.",
    });
  }

  return await fetchMovieDetail(event, id);
});
