// English description: Implements the movie catalog repository through the authenticated Nuxt API bridge.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry";
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client";
import type { MoviesRepository } from "../../domain/repositories/MoviesRepository";
import type {
  MovieDetailPage,
  MoviesCatalogPage,
} from "../../domain/types/movies.types";
import type {
  FeedCommentRecord,
  FeedPostActionResult,
} from "../../../feed/domain/types/feed.types";

export function createApiMoviesRepository(): MoviesRepository {
  const client = useNuxtApiClient();

  return {
    async getCatalog(query = {}) {
      return await client.get<MoviesCatalogPage>(apiRoutes.movies.catalog, {
        search: query.search,
        genre: query.genre,
        country: query.country,
        tab: query.tab,
        offset: query.offset,
        limit: query.limit,
      });
    },
    async getDetail(id) {
      return await client.get<MovieDetailPage>(apiRoutes.movies.detail(id));
    },
    async getComments(id) {
      return await client.get<FeedCommentRecord[]>(
        apiRoutes.movies.comments(id),
      );
    },
    async addComment(id, input) {
      return await client.post<FeedCommentRecord, { text: string }>(
        apiRoutes.movies.comments(id),
        { text: input.text },
      );
    },
    async getCommentReplies(id, input) {
      return await client.get<FeedCommentRecord[]>(
        apiRoutes.movies.commentReplies(id),
        {
          commentId: input.commentId,
          limit: input.limit,
          offset: input.offset,
        },
      );
    },
    async runCommentAction(id, input) {
      return await client.post<FeedPostActionResult, Record<string, unknown>>(
        apiRoutes.movies.commentAction(id),
        input as Record<string, unknown>,
      );
    },
  };
}
