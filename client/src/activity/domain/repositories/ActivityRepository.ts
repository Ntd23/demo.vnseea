// English description: Declares the Nuxt Activity Center repository port.
import type { ActivityCenterTab, PostActivityPage } from "../types/activity.types"

export interface ActivityRepository {
  getPostActivity(input: {
    category: ActivityCenterTab
    cursor?: string
    limit?: number
  }): Promise<PostActivityPage>
}
