// English description: Nuxt API backed repository for community groups, pages, and management flows.

import { useNuxtApiClient } from "#shared-kernel/infrastructure/http/nuxt-api-client"
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

const communityApiRoutes = {
  groups: "community/groups",
  groupBySlug: (slug: string) => `community/groups/${encodeURIComponent(slug)}`,
  groupJoin: (slug: string) => `community/groups/${encodeURIComponent(slug)}/join`,
  pages: "community/pages",
  pageBySlug: (slug: string) => `community/pages/${encodeURIComponent(slug)}`,
  pageFollow: (slug: string) => `community/pages/${encodeURIComponent(slug)}/follow`,
} as const

export function createApiCommunityRepository(): CommunityRepository {
  const client = useNuxtApiClient()

  return {
    async getGroups(mode: CommunityGroupTab) {
      return await client.get<CommunityGroupRecord[]>(communityApiRoutes.groups, { mode })
    },
    async getGroupBySlug(slug: string) {
      return await client.get<CommunityGroupRecord | null>(communityApiRoutes.groupBySlug(slug))
    },
    async createGroup(input: CommunityDraft) {
      return await client.post<CommunityGroupRecord, CommunityDraft>(communityApiRoutes.groups, input)
    },
    async updateGroup(slug: string, input: CommunityGroupSettingsDraft) {
      return await client.put<CommunityGroupRecord, CommunityGroupSettingsDraft>(
        communityApiRoutes.groupBySlug(slug),
        input,
      )
    },
    async joinGroup(slug: string) {
      return await client.post<CommunityGroupRecord>(communityApiRoutes.groupJoin(slug))
    },
    async getPages(mode: CommunityPageTab) {
      return await client.get<CommunityPageRecord[]>(communityApiRoutes.pages, { mode })
    },
    async getPageBySlug(slug: string) {
      return await client.get<CommunityPageRecord | null>(communityApiRoutes.pageBySlug(slug))
    },
    async createPage(input: CommunityDraft) {
      return await client.post<CommunityPageRecord, CommunityDraft>(communityApiRoutes.pages, input)
    },
    async updatePage(slug: string, input: CommunityPageSettingsDraft) {
      return await client.put<CommunityPageRecord, CommunityPageSettingsDraft>(
        communityApiRoutes.pageBySlug(slug),
        input,
      )
    },
    async followPage(slug: string) {
      return await client.post<CommunityPageRecord>(communityApiRoutes.pageFollow(slug))
    },
  }
}

