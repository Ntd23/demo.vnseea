// English description: Bridges movie comment reply and like or dislike actions to the PHP API.

import { createError, getRouterParam, readBody } from "h3";
import { assertBackendApiSuccess } from "../../../../utils/backend-api-response";
import { createBackendApiClient } from "../../../../utils/backend-api-client";
import { createBackendMediaUrlResolver } from "../../../../utils/backend-media-url";
import {
  asMovieCommentNumber,
  asMovieCommentString,
  type BackendMovieCommentsResponse,
  mapMovieComment,
  normalizeMovieCommentReaction,
} from "../../_comments";
import {
  isFeedStoryReaction,
  type FeedStoryReactionType,
} from "../../../../../src/feed/domain/constants/story-reactions";
import type { FeedPostActionResult } from "../../../../../src/feed/domain/types/feed.types";

export default defineEventHandler(async (event) => {
  const movieId = Number.parseInt(
    String(getRouterParam(event, "id") || ""),
    10,
  );
  const body = await readBody<Record<string, unknown>>(event);
  const action = asMovieCommentString(body.action);

  if (!Number.isInteger(movieId) || movieId <= 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Movie not found.",
    });
  }

  if (action === "reply") {
    const commentId = asMovieCommentNumber(body.commentId);
    const text = asMovieCommentString(body.text);
    const backendText = text.length > 2 ? text : text.padEnd(3, " ");

    if (!commentId || !text) {
      throw createError({
        statusCode: 400,
        statusMessage: "Reply text is required.",
      });
    }

    const response = assertBackendApiSuccess(
      await createBackendApiClient(event).post<
        BackendMovieCommentsResponse,
        Record<string, unknown>
      >("movies_comments", {
        type: "add_reply",
        movie_id: movieId,
        comment_id: commentId,
        text: backendText,
      }),
      "Unable to reply to movie comment.",
    );
    const rawReply = response.data?.[0];

    if (!rawReply) {
      throw createError({
        statusCode: 400,
        statusMessage: "Movie reply was not returned by the backend.",
        data: response,
      });
    }

    return {
      ok: true,
      commentId: asMovieCommentNumber(rawReply.id),
      reply: mapMovieComment(rawReply, createBackendMediaUrlResolver(event)),
    } satisfies FeedPostActionResult;
  }

  if (action === "reaction") {
    const target = asMovieCommentString(body.target);
    const targetId = asMovieCommentNumber(body.targetId);
    const reaction = asMovieCommentString(body.reaction);

    if (
      !targetId ||
      (target !== "comment" && target !== "reply") ||
      !isFeedStoryReaction(reaction)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Movie comment reaction payload is invalid.",
      });
    }

    const response = assertBackendApiSuccess(
      await createBackendApiClient(event).post<
        BackendMovieCommentsResponse,
        Record<string, unknown>
      >("movies_comments", {
        type: target === "reply" ? "reply_like" : "like",
        movie_id: movieId,
        comment_id: targetId,
        reaction_type: normalizeMovieCommentReaction(
          reaction as FeedStoryReactionType,
        ),
      }),
      "Unable to react to movie comment.",
    );

    return {
      ok: true,
      reaction:
        asMovieCommentNumber(response.code) > 0
          ? (reaction as FeedStoryReactionType)
          : null,
    } satisfies FeedPostActionResult;
  }

  throw createError({
    statusCode: 400,
    statusMessage: "Movie comment action is invalid.",
  });
});
