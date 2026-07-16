// English description: Repository contract for loading backend-backed profile data by username.

import type {
  ProfileActionResult,
  ProfileApiResponse,
  ProfileMediaKind,
  ProfileMediaPostResponse,
  ProfilePostsResponse,
} from "../types/profile.types"

export interface ProfileRepository {
  getProfileByUsername(username: string): Promise<ProfileApiResponse | null>
  getProfilePosts(input: {
    username: string
    afterPostId?: number | null
  }): Promise<ProfilePostsResponse>
  getProfileMediaPost(input: {
    username: string
    kind: ProfileMediaKind
  }): Promise<ProfileMediaPostResponse>
  runProfileAction(input: {
    action: "follow"
    userId: number
  }): Promise<ProfileActionResult>
}
