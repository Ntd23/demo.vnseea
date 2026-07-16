// English description: Adds a text comment to one backend movie.

import { createError, getRouterParam, readBody } from "h3";
import { assertBackendApiSuccess } from "../../../utils/backend-api-response";
import { createBackendApiClient } from "../../../utils/backend-api-client";
import { createBackendMediaUrlResolver } from "../../../utils/backend-media-url";
import {
  asMovieCommentString,
  type BackendMovieCommentsResponse,
  mapMovieComment,
} from "../_comments";

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(String(getRouterParam(event, "id") || ""), 10);
  const body = await readBody<{ text?: string }>(event);
  const text = asMovieCommentString(body.text);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Movie not found.",
    });
  }

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment content is required.",
    });
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<
      BackendMovieCommentsResponse,
      Record<string, unknown>
    >("movies_comments", {
      type: "add_comment",
      movie_id: id,
      text,
    }),
    "Unable to add movie comment.",
  );
  const rawComment = response.data?.[0];

  if (!rawComment) {
    throw createError({
      statusCode: 400,
      statusMessage: "Movie comment was not returned by the backend.",
      data: response,
    });
  }

  return mapMovieComment(rawComment, createBackendMediaUrlResolver(event));
});
