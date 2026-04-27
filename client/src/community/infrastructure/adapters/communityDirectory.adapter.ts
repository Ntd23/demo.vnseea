import { createCommunitySlug } from "../../domain/services/community-helpers.service"
import {
  communityGroupDirectory,
  communityGroupMembers,
  communityPageDirectory,
} from "../mocks/communityDirectory.mock"

export const findCommunityGroupBySlug = (slug: string) =>
  communityGroupDirectory.find(group => group.slug === slug)

export const findCommunityGroupMembers = (slug: string) =>
  communityGroupMembers[slug] ?? []

export const findCommunityPageBySlug = (slug: string) =>
  communityPageDirectory.find(page => page.slug === slug)

export const createCommunityPageSlug = (name: string) => createCommunitySlug(name)
