// English description: Normalizes backend movie comments and replies into the shared frontend comment shape.

import { appRoutes } from "../../../src/shared-kernel/application/constants/route-registry";
import type { FeedCommentRecord } from "../../../src/feed/domain/types/feed.types";
import type { FeedStoryReactionType } from "../../../src/feed/domain/constants/story-reactions";

export type BackendMovieCommentEntity = Record<string, unknown>;

export type BackendMovieCommentsResponse = {
  api_status?: number | string;
  code?: number | string;
  data?: BackendMovieCommentEntity[];
  errors?: {
    error_text?: string;
  };
};

export const asMovieCommentString = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

export const asMovieCommentNumber = (value: unknown) => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
};

const asBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

const asEntity = (value: unknown): BackendMovieCommentEntity =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as BackendMovieCommentEntity)
    : {};

const asArray = (value: unknown): BackendMovieCommentEntity[] =>
  Array.isArray(value) ? value.map((item) => asEntity(item)) : [];

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstString = (entity: BackendMovieCommentEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asMovieCommentString(entity[key]);
    if (value) return value;
  }

  return "";
};

const firstNumber = (entity: BackendMovieCommentEntity, keys: string[]) => {
  for (const key of keys) {
    const value = asMovieCommentNumber(entity[key]);
    if (value > 0) return value;
  }

  return 0;
};

const formatCommentTime = (value: unknown) => {
  const timestamp = asMovieCommentNumber(value);

  if (timestamp > 0) {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp * 1000));
  }

  return asMovieCommentString(value);
};

export const mapMovieComment = (
  entity: BackendMovieCommentEntity,
  resolveMediaUrl: (value: unknown) => string,
): FeedCommentRecord => {
  const user = asEntity(entity.user_data || entity.publisher);
  const author = firstString(user, ["name", "username"]) || "User";
  const username = firstString(user, ["username"]);
  const replies = asArray(entity.replies);
  const liked = asBoolean(entity.is_comment_liked);
  const disliked = asBoolean(entity.is_comment_wondered);

  return {
    id: firstNumber(entity, ["id", "comment_id"]),
    author,
    authorAvatarUrl: resolveMediaUrl(
      firstString(user, ["avatar_full", "avatar"]),
    ),
    authorPath: username ? appRoutes.profile(username) : undefined,
    role: username ? `@${username}` : author,
    text: stripHtml(firstString(entity, ["text", "Orginaltext", "comment"])),
    time: formatCommentTime(entity.time_text || entity.posted),
    reactionsCount:
      asMovieCommentNumber(entity.likes) +
      asMovieCommentNumber(entity.dislikes),
    selectedReaction: liked ? "Like" : disliked ? "Angry" : null,
    repliesCount: replies.length,
    replies: replies.map((reply) => mapMovieComment(reply, resolveMediaUrl)),
  };
};

export const normalizeMovieCommentReaction = (
  reaction: FeedStoryReactionType,
) => (reaction === "Angry" ? "dislike" : "like");
