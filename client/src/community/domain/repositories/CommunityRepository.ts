// English description: Repository contract for community directory, detail, and management API operations.

import type {
  CommunityDraft,
  CommunityGroupRecord,
  CommunityGroupSettingsDraft,
  CommunityGroupTab,
  CommunityPageRecord,
  CommunityPageSettingsDraft,
  CommunityPageTab,
} from "../types/community.types"

export interface CommunityRepository {
  getGroups(mode: CommunityGroupTab): Promise<CommunityGroupRecord[]>
  getGroupBySlug(slug: string): Promise<CommunityGroupRecord | null>
  createGroup(input: CommunityDraft): Promise<CommunityGroupRecord>
  updateGroup(slug: string, input: CommunityGroupSettingsDraft): Promise<CommunityGroupRecord>
  joinGroup(slug: string): Promise<CommunityGroupRecord>
  getPages(mode: CommunityPageTab): Promise<CommunityPageRecord[]>
  getPageBySlug(slug: string): Promise<CommunityPageRecord | null>
  createPage(input: CommunityDraft): Promise<CommunityPageRecord>
  updatePage(slug: string, input: CommunityPageSettingsDraft): Promise<CommunityPageRecord>
  followPage(slug: string): Promise<CommunityPageRecord>
}

