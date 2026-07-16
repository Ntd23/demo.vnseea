// English description: Declares the movie catalog repository contract consumed by the Movies page view-model.

import type {
  MovieDetailPage,
  MoviesCatalogPage,
  MoviesCatalogQuery,
} from "../types/movies.types";
import type {
  FeedCommentRecord,
  FeedCommentSubmitPayload,
  FeedPostActionResult,
} from "../../../feed/domain/types/feed.types";
import type { FeedStoryReactionType } from "../../../feed/domain/constants/story-reactions";

export interface MoviesRepository {
  getCatalog(query?: MoviesCatalogQuery): Promise<MoviesCatalogPage>;
  getDetail(id: number): Promise<MovieDetailPage>;
  getComments(id: number): Promise<FeedCommentRecord[]>;
  addComment(
    id: number,
    input: FeedCommentSubmitPayload,
  ): Promise<FeedCommentRecord>;
  getCommentReplies(
    id: number,
    input: { commentId: number; limit?: number; offset?: number },
  ): Promise<FeedCommentRecord[]>;
  runCommentAction(
    id: number,
    input:
      | {
          action: "reply";
          commentId: number;
          text?: string;
        }
      | {
          action: "reaction";
          target: "comment" | "reply";
          targetId: number;
          reaction: FeedStoryReactionType;
        },
  ): Promise<FeedPostActionResult>;
}
