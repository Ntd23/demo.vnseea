// English description: Loads reply comments for one backend movie comment.

import { createError, getQuery } from "h3";
import { assertBackendApiSuccess } from "../../../../utils/backend-api-response";
import { createBackendApiClient } from "../../../../utils/backend-api-client";
import { createBackendMediaUrlResolver } from "../../../../utils/backend-media-url";
import {
  asMovieCommentNumber,
  type BackendMovieCommentsResponse,
  mapMovieComment,
} from "../../_comments";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const commentId = asMovieCommentNumber(query.commentId);
  const limit = Math.max(
    1,
    Math.min(asMovieCommentNumber(query.limit) || 10, 50),
  );
  const offset = Math.max(0, asMovieCommentNumber(query.offset));

  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comment id is required.",
    });
  }

  const response = assertBackendApiSuccess(
    await createBackendApiClient(event).post<
      BackendMovieCommentsResponse,
      Record<string, unknown>
    >("movies_comments", {
      type: "reply_fetch",
      comment_id: commentId,
      limit,
      offset: offset || undefined,
    }),
    "Unable to load movie comment replies.",
  );
  const resolveMediaUrl = createBackendMediaUrlResolver(event);

  return (response.data ?? []).map((reply) =>
    mapMovieComment(reply, resolveMediaUrl),
  );
});
