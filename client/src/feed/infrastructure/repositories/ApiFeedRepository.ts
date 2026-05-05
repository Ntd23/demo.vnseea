// English description: Implements the shared Dev 2 feed repository against Nuxt server API routes.

import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { FeedRepository } from "../../domain/repositories/FeedRepository"
import type {
  FeedCreatePostResponse,
  FeedCreateStoryResponse,
  FeedExploreResponse,
  FeedHomeResponse,
  FeedMemoriesResponse,
  FeedPokeActionResult,
  FeedPokeRecord,
  FeedPostsResponse,
} from "../../domain/types/feed.types"

const feedApiRoutes = {
  explore: "feed/explore",
  hashtag: (tag: string) => `feed/hashtag/${encodeURIComponent(tag)}`,
  home: "feed/home",
  memories: "feed/memories",
  photos: "feed/photos",
  poke: "feed/poke",
  popular: "feed/popular",
  postAction: "feed/posts/action",
  postCreate: "feed/posts/create",
  saved: "feed/saved",
  storyCreate: "feed/stories/create",
  videos: "feed/videos",
} as const

const normalizeOffset = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : undefined

export function createApiFeedRepository(): FeedRepository {
  const client = useNuxtApiClient()

  return {
    async getHome(input) {
      return await client.get<FeedHomeResponse>(feedApiRoutes.home, {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
        postType: input?.postType,
        followingOnly: input?.followingOnly ? 1 : 0,
      })
    },
    async getSaved(input) {
      return await client.get<FeedPostsResponse>(feedApiRoutes.saved, {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
      })
    },
    async getHashtag(tag, input) {
      return await client.get<FeedPostsResponse>(feedApiRoutes.hashtag(tag), {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
      })
    },
    async getVideos(input) {
      return await client.get<FeedPostsResponse>(feedApiRoutes.videos, {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
      })
    },
    async getPopular(input) {
      return await client.get<FeedPostsResponse>(feedApiRoutes.popular, {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
      })
    },
    async getPhotos(input) {
      return await client.get<FeedPostsResponse>(feedApiRoutes.photos, {
        limit: input?.limit,
        afterPostId: normalizeOffset(input?.afterPostId),
      })
    },
    async getExplore(input) {
      return await client.get<FeedExploreResponse>(feedApiRoutes.explore, {
        limit: input?.limit,
      })
    },
    async getMemories() {
      return await client.get<FeedMemoriesResponse>(feedApiRoutes.memories)
    },
    async getPokes() {
      return await client.get<FeedPokeRecord[]>(feedApiRoutes.poke)
    },
    async runPostAction(input) {
      return await client.post<{ ok: boolean }, Record<string, unknown>>(
        feedApiRoutes.postAction,
        input,
      )
    },
    async createPost(input) {
      return await client.post<FeedCreatePostResponse, Record<string, unknown>>(
        feedApiRoutes.postCreate,
        input,
      )
    },
    async createStory(input) {
      const formData = new FormData()
      formData.append("file", input.file, input.file.name)
      formData.append("fileType", input.fileType)

      if (input.title) {
        formData.append("title", input.title)
      }

      if (input.description) {
        formData.append("description", input.description)
      }

      return await client.post<FeedCreateStoryResponse, FormData>(
        feedApiRoutes.storyCreate,
        formData,
      )
    },
    async runPokeAction(input) {
      return await client.post<FeedPokeActionResult, Record<string, unknown>>(
        feedApiRoutes.poke,
        input,
      )
    },
  }
}
