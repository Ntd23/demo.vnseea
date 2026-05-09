// English description: Nuxt API backed repository for community groups, pages, and management flows.

import { apiRoutes } from "#shared-kernel/application/constants/route-registry"
import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
import type { FeedPostsResponse } from "../../../feed/domain/types/feed.types"
import type { CommunityRepository } from "../../domain/repositories/CommunityRepository"
import type {
  CommunityDraft,
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
  CommunityGroupTab,
  CommunityPageRecord,
  CommunityPageSettingsDraft,
  CommunityPageTab,
} from "../../domain/types/community.types"

export function createApiCommunityRepository(): CommunityRepository {
  const client = useNuxtApiClient()

  return {
    async getGroups(mode: CommunityGroupTab) {
      return await client.get<CommunityGroupRecord[]>(apiRoutes.community.groups, { mode })
    },
    async getGroupBySlug(slug: string) {
      return await client.get<CommunityGroupRecord | null>(apiRoutes.community.groupBySlug(slug))
    },
    async createGroup(input: CommunityDraft) {
      return await client.post<CommunityGroupRecord, CommunityDraft>(apiRoutes.community.groups, input)
    },
    async updateGroup(slug: string, input: CommunityGroupSettingsDraft) {
      return await client.put<CommunityGroupRecord, CommunityGroupSettingsDraft>(
        apiRoutes.community.groupBySlug(slug),
        input,
      )
    },
    async joinGroup(slug: string) {
      return await client.post<CommunityGroupRecord>(apiRoutes.community.groupJoin(slug))
    },
    async getPages(mode: CommunityPageTab) {
      return await client.get<CommunityPageRecord[]>(apiRoutes.community.pages, { mode })
    },
    async getPageBySlug(slug: string) {
      return await client.get<CommunityPageRecord | null>(apiRoutes.community.pageBySlug(slug))
    },
    async createPage(input: CommunityDraft) {
      return await client.post<CommunityPageRecord, CommunityDraft>(apiRoutes.community.pages, input)
    },
    async updatePage(slug: string, input: CommunityPageSettingsDraft) {
      const formData = new FormData()
      const fields: Array<keyof CommunityPageSettingsDraft> = [
        "name",
        "slug",
        "summary",
        "website",
        "locationLabel",
        "category",
        "ctaLabel",
        "responseLabel",
        "ownerLabel",
        "allowMessages",
        "showFollowerCount",
        "showLikeCount",
        "showWebsite",
        "recommendRelatedPages",
      ]

      fields.forEach((key) => {
        const value = input[key]

        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value))
        }
      })

      if (input.avatarFile) formData.append("avatar", input.avatarFile)
      if (input.bannerFile) formData.append("banner", input.bannerFile)

      try {
        const result = await client.put<CommunityPageRecord, CommunityPageSettingsDraft>(
          apiRoutes.community.pageBySlug(slug),
          formData as any,
        )

        console.log(`[Repository] Update result for ${slug}:`, result)
        return result
      } catch (error) {
        console.error(`[Repository] Update FAILED for ${slug}:`, error)
        throw error
      }
    },
    async followPage(slug: string) {
      return await client.post<CommunityPageRecord>(apiRoutes.community.pageFollow(slug))
    },
    async getPagePosts(slug, input) {
      return await client.get<FeedPostsResponse>(apiRoutes.community.pagePosts(slug), {
        limit: input?.limit,
        afterPostId: input?.afterPostId,
      })
    },
    async deletePage(id: number) {
      await client.delete(apiRoutes.community.pageById(id))
    },
    async deleteGroup(id: number) {
      await client.delete(apiRoutes.community.groupById(id))
    },
  }
}
