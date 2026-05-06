// English description: Declares the frontend repository contract for feed, media, discover, memory, story, and poke API bridges.

import type {
  FeedCreatePostResponse,
  FeedCreateStoryResponse,
  FeedExploreResponse,
  FeedHomeResponse,
  FeedMemoriesResponse,
  FeedPokeActionResult,
  FeedPokeRecord,
  FeedPostsResponse,
  FeedStoryActionResult,
  FeedStoryReactionType,
} from "../types/feed.types"

export interface FeedRepository {
  getHome(input?: {
    limit?: number
    afterPostId?: number
    postType?: string
    followingOnly?: boolean
  }): Promise<FeedHomeResponse>
  getSaved(input?: { limit?: number; afterPostId?: number }): Promise<FeedPostsResponse>
  getHashtag(tag: string, input?: { limit?: number; afterPostId?: number }): Promise<FeedPostsResponse>
  getVideos(input?: { limit?: number; afterPostId?: number }): Promise<FeedPostsResponse>
  getPopular(input?: { limit?: number; afterPostId?: number }): Promise<FeedPostsResponse>
  getPhotos(input?: { limit?: number; afterPostId?: number }): Promise<FeedPostsResponse>
  getExplore(input?: { limit?: number }): Promise<FeedExploreResponse>
  getMemories(): Promise<FeedMemoriesResponse>
  getPokes(): Promise<FeedPokeRecord[]>
  runPostAction(input: {
    action: "like" | "reaction" | "comment" | "save" | "report"
    postId: number
    reaction?: FeedStoryReactionType
    text?: string
  }): Promise<{ ok: boolean }>
  createPost(input: {
    text: string
    audience?: string
  }): Promise<FeedCreatePostResponse>
  createStory(input: {
    file: File
    fileType: "image" | "video"
    title?: string
    description?: string
  }): Promise<FeedCreateStoryResponse>
  runStoryAction(input:
    | {
      action: "react"
      storyId: number
      reaction: FeedStoryReactionType
    }
    | {
      action: "reply"
      storyId: number
      ownerId: number
      text: string
    }
  ): Promise<FeedStoryActionResult>
  runPokeAction(input: {
    action: "create" | "remove"
    userId?: number
    pokeId?: number
  }): Promise<FeedPokeActionResult>
}
