// English description: Declares the repository contract for the backend-backed live studio context.

import type {
  GoLiveDraft,
  LiveMutationResult,
  LiveStudioBootstrap,
  LiveStudioHeartbeat,
  LiveStudioSession,
} from "../types/live.types"

export interface LiveRepository {
  getBootstrap(): Promise<LiveStudioBootstrap>
  createSession(input: GoLiveDraft): Promise<LiveStudioSession>
  getHeartbeat(postId: number, knownCommentIds?: number[]): Promise<LiveStudioHeartbeat>
  endSession(postId: number): Promise<LiveMutationResult>
  uploadThumbnail(postId: number, thumbnailFile: File): Promise<LiveMutationResult>
}
