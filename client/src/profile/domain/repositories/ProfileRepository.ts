// English description: Repository contract for loading backend-backed profile data by username.

import type { ProfileApiResponse } from "../types/profile.types"

export interface ProfileRepository {
  getProfileByUsername(username: string): Promise<ProfileApiResponse | null>
}

