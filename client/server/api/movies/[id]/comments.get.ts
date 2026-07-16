// English description: Returns normalized comments for one backend movie.

import { createError, getQuery, getRouterParam } from "h3";
import { assertBackendApiSuccess } from "../../../utils/backend-api-response";
import { createBackendApiClient } from "../../../utils/backend-api-client";
import { createBackendMediaUrlResolver } from "../../../utils/backend-media-url";
import {
  asMovieCommentNumber,
  type BackendMovieCommentsResponse,
  mapMovieComment,
} from "../_comments";

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(String(getRouterParam(event, "id") || ""), 10);
  const query = getQuery(event);
  const limit = Math.max(
    1,
    Math.min(asMovieCommentNumber(query.limit) || 20, 50),
  );
  const offset = Math.max(0, asMovieCommentNumber(query.offset));

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Movie not found.",
    });
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<
      BackendMovieCommentsResponse,
      Record<string, unknown>
    >("movies_comments", {
      type: "get_comments",
      movie_id: id,
      limit,
      offset: offset || undefined,
    }),
    "Unable to load movie comments.",
  );
  const resolveMediaUrl = createBackendMediaUrlResolver(event);

  return (response.data ?? []).map((comment) =>
    mapMovieComment(comment, resolveMediaUrl),
  );
});
