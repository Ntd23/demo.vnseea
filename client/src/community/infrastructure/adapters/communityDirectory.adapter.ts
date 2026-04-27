import {
  createCommunitySlug,
  getCommunityGroupBySlug,
  getCommunityGroupMembers,
  getCommunityPageBySlug,
} from "../../../../types/community"

export const findCommunityGroupBySlug = (slug: string) => getCommunityGroupBySlug(slug)

export const findCommunityGroupMembers = (slug: string) => getCommunityGroupMembers(slug)

export const findCommunityPageBySlug = (slug: string) => getCommunityPageBySlug(slug)

export const createCommunityPageSlug = (name: string) => createCommunitySlug(name)
